<?php

declare(strict_types=1);

function jsonResponse(array $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    jsonResponse(['ok' => true]);
}

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = getenv('AUDIT_DB_HOST') ?: 'sudosquad_auditoria_db';
    $port = getenv('AUDIT_DB_PORT') ?: '5432';
    $database = getenv('AUDIT_DB_DATABASE') ?: 'sudosquad_auditoria_db';
    $username = getenv('AUDIT_DB_USERNAME') ?: 'sudosquad_auditoria_user';
    $password = getenv('AUDIT_DB_PASSWORD') ?: 'sudosquad_auditoria_secret_2026';

    $dsn = "pgsql:host={$host};port={$port};dbname={$database}";

    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    return $pdo;
}

function requestPath(): string
{
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

    return rtrim($uri ?: '/', '/') ?: '/';
}

function auditEvents(): void
{
    $page = max(1, (int) ($_GET['page'] ?? 1));
    $perPage = min(100, max(1, (int) ($_GET['per_page'] ?? 20)));
    $offset = ($page - 1) * $perPage;

    $where = [];
    $params = [];

    $exactFilters = [
        'event' => 'event',
        'module' => 'module',
        'aggregate_type' => 'aggregate_type',
        'aggregate_id' => 'aggregate_id',
        'actor_email' => 'actor_email',
        'target_email' => 'target_email',
    ];

    foreach ($exactFilters as $queryKey => $column) {
        if (isset($_GET[$queryKey]) && trim((string) $_GET[$queryKey]) !== '') {
            $where[] = "{$column} = :{$queryKey}";
            $params[$queryKey] = trim((string) $_GET[$queryKey]);
        }
    }

    if (isset($_GET['date_from']) && trim((string) $_GET['date_from']) !== '') {
        $where[] = 'occurred_at >= :date_from';
        $params['date_from'] = trim((string) $_GET['date_from']);
    }

    if (isset($_GET['date_to']) && trim((string) $_GET['date_to']) !== '') {
        $where[] = 'occurred_at <= :date_to';
        $params['date_to'] = trim((string) $_GET['date_to']);
    }

    if (isset($_GET['search']) && trim((string) $_GET['search']) !== '') {
        $where[] = '(
            event ILIKE :search
            OR module ILIKE :search
            OR aggregate_type ILIKE :search
            OR actor_email ILIKE :search
            OR target_email ILIKE :search
            OR description ILIKE :search
        )';
        $params['search'] = '%' . trim((string) $_GET['search']) . '%';
    }

    $whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

    $countSql = "SELECT COUNT(*) AS total FROM audit_events {$whereSql}";
    $countStmt = db()->prepare($countSql);
    $countStmt->execute($params);
    $total = (int) $countStmt->fetch()['total'];

    $sql = "
        SELECT
            id,
            event_id,
            event,
            module,
            aggregate_type,
            aggregate_id,
            actor_id,
            actor_name,
            actor_email,
            actor_role,
            target_name,
            target_email,
            description,
            ip_address,
            occurred_at,
            created_at
        FROM audit_events
        {$whereSql}
        ORDER BY occurred_at DESC NULLS LAST, id DESC
        LIMIT :limit OFFSET :offset
    ";

    $stmt = db()->prepare($sql);

    foreach ($params as $key => $value) {
        $stmt->bindValue(":{$key}", $value);
    }

    $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    jsonResponse([
        'data' => $stmt->fetchAll(),
        'meta' => [
            'page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'last_page' => (int) ceil($total / $perPage),
        ],
        'filters' => [
            'event' => $_GET['event'] ?? null,
            'module' => $_GET['module'] ?? null,
            'aggregate_type' => $_GET['aggregate_type'] ?? null,
            'aggregate_id' => $_GET['aggregate_id'] ?? null,
            'actor_email' => $_GET['actor_email'] ?? null,
            'target_email' => $_GET['target_email'] ?? null,
            'date_from' => $_GET['date_from'] ?? null,
            'date_to' => $_GET['date_to'] ?? null,
            'search' => $_GET['search'] ?? null,
        ],
    ]);
}

function auditEventDetail(int $id): void
{
    $stmt = db()->prepare('
        SELECT *
        FROM audit_events
        WHERE id = :id
        LIMIT 1
    ');

    $stmt->execute(['id' => $id]);
    $event = $stmt->fetch();

    if (! $event) {
        jsonResponse([
            'message' => 'Evento de auditoría no encontrado.',
        ], 404);
    }

    if (isset($event['payload'])) {
        $event['payload'] = json_decode((string) $event['payload'], true);
    }

    jsonResponse([
        'data' => $event,
    ]);
}

try {
    $path = requestPath();

    if ($path === '/health') {
        jsonResponse([
            'status' => 'ok',
            'service' => 'sudosquad-auditoria-api',
            'database' => 'connected',
        ]);
    }

    if ($path === '/audit-events') {
        auditEvents();
    }

    if (preg_match('#^/audit-events/(\d+)$#', $path, $matches)) {
        auditEventDetail((int) $matches[1]);
    }

    jsonResponse([
        'message' => 'Ruta no encontrada.',
        'available_routes' => [
            'GET /health',
            'GET /audit-events',
            'GET /audit-events/{id}',
        ],
    ], 404);
} catch (Throwable $e) {
    jsonResponse([
        'message' => 'Error interno en auditoría.',
        'error' => $e->getMessage(),
    ], 500);
}
