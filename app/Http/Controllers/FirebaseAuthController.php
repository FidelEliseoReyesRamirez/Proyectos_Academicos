<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Kreait\Firebase\Factory;

class FirebaseAuthController extends Controller
{
    public function token(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        $serviceAccountPath = storage_path('app/firebase/service-account.json');

        if (! file_exists($serviceAccountPath)) {
            return response()->json([
                'message' => 'No se encontro la cuenta de servicio de Firebase.',
            ], 500);
        }

        $factory = (new Factory)->withServiceAccount($serviceAccountPath);
        $auth = $factory->createAuth();

        $uid = (string) $user->id;

        $claims = [
            'laravel_id' => (int) $user->id,
            'rol' => (string) $user->rol,
            'email' => (string) $user->email,
            'name' => (string) $user->name,
        ];

        $customToken = $auth->createCustomToken($uid, $claims);

        return response()->json([
            'token' => $customToken->toString(),
            'uid' => $uid,
            'claims' => $claims,
        ]);
    }
}
