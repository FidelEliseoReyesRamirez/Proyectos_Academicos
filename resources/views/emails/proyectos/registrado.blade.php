<x-mail::message>
# Registro de Proyecto Exitoso

Hola **{{ $proyecto->estudiante->name }}**,

Tu proyecto académico ha sido formalizado exitosamente en la plataforma de la **Universidad Privada del Valle**. A continuación, te presentamos los datos registrados para tu seguimiento:

<x-mail::panel>
**Código Único:** {{ $proyecto->codigo }}  
**Título:** {{ $proyecto->titulo }}  
**Modalidad:** {{ $proyecto->modalidad }}  
**Área Temática:** {{ $proyecto->area_tematica }}  
**Estado Actual:** {{ ucfirst(str_replace('_', ' ', $proyecto->estado)) }}  
</x-mail::panel>

> **Nota importante:** Conserva tu código único (`{{ $proyecto->codigo }}`), ya que será requerido para la revisión, presentación y cualquier trámite futuro.

<x-mail::button :url="route('proyectos.index')">
Ir a mis proyectos
</x-mail::button>

Atentamente,<br>
**Coordinación de Proyectos**<br>
{{ config('app.name') }}
</x-mail::message>