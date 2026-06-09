<?php

namespace App\Http\Controllers;

use App\Models\Proyecto;
use Google\Auth\Credentials\ServiceAccountCredentials;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class ProyectoChatController extends Controller
{
    public function show(Request $request, Proyecto $proyecto): Response
    {
        $user = $request->user();

        abort_unless($user, 401);

        $participantIds = $this->obtenerParticipantes($proyecto);

        $puedeVer = in_array($user->rol, ['admin', 'coordinador'], true)
            || in_array((string) $user->id, $participantIds, true);

        abort_unless($puedeVer, 403);

        $this->sincronizarThreadFirestore($proyecto, $participantIds);

        return Inertia::render('proyectos/chat', [
            'proyecto' => [
                'id' => $proyecto->id,
                'codigo' => $proyecto->codigo,
                'titulo' => $proyecto->titulo,
                'estado' => $proyecto->estado,
            ],
            'threadId' => (string) $proyecto->id,
            'participantIds' => $participantIds,
        ]);
    }

    private function obtenerParticipantes(Proyecto $proyecto): array
    {
        $ids = collect([
            $proyecto->estudiante_id,
            $proyecto->tutor_id,
        ]);

        $revisores = DB::table('proyecto_revisores')
            ->where('proyecto_id', $proyecto->id)
            ->pluck('revisor_id');

        return $ids
            ->merge($revisores)
            ->filter()
            ->map(fn ($id) => (string) $id)
            ->unique()
            ->values()
            ->all();
    }

    private function sincronizarThreadFirestore(Proyecto $proyecto, array $participantIds): void
    {
        $serviceAccountPath = storage_path('app/firebase/service-account.json');

        if (! file_exists($serviceAccountPath)) {
            abort(500, 'No se encontro la cuenta de servicio de Firebase.');
        }

        $serviceAccount = json_decode(file_get_contents($serviceAccountPath), true);

        if (! is_array($serviceAccount) || empty($serviceAccount['project_id'])) {
            abort(500, 'La cuenta de servicio de Firebase no es valida.');
        }

        $projectId = $serviceAccount['project_id'];

        $credentials = new ServiceAccountCredentials(
            ['https://www.googleapis.com/auth/datastore'],
            $serviceAccount
        );

        $token = $credentials->fetchAuthToken();

        if (empty($token['access_token'])) {
            abort(500, 'No se pudo generar token de acceso para Firestore.');
        }

        $url = sprintf(
            'https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents/project_threads/%s',
            $projectId,
            $proyecto->id
        );

        $participantValues = array_map(
            fn (string $id) => ['stringValue' => $id],
            $participantIds
        );

        $payload = [
            'fields' => [
                'projectId' => ['integerValue' => (string) $proyecto->id],
                'projectCode' => ['stringValue' => (string) $proyecto->codigo],
                'projectTitle' => ['stringValue' => (string) $proyecto->titulo],
                'participantIds' => [
                    'arrayValue' => [
                        'values' => $participantValues,
                    ],
                ],
                'updatedAt' => ['timestampValue' => now()->toISOString()],
            ],
        ];

        $response = Http::withToken($token['access_token'])
            ->patch($url, $payload);

        if (! $response->successful()) {
            abort(500, 'No se pudo sincronizar el hilo de Firestore: ' . $response->body());
        }
    }
}
