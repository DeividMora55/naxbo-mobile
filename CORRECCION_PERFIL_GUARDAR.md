# Corrección: guardar cambios del perfil

Se corrigió el error genérico **“Revisa los datos del perfil”** que afectaba especialmente a cuentas de trabajador creadas antes de añadir los nuevos campos profesionales.

## Cambios

- El backend permite guardar datos personales aunque el perfil profesional todavía esté incompleto.
- Los campos profesionales se validan únicamente cuando tienen contenido.
- La modalidad vacía se normaliza a `domicilio`.
- La app ya no envía todo el objeto de usuario; solo campos editables.
- La categoría principal se selecciona de las categorías válidas de NAXVO.
- La modalidad se selecciona con botones válidos: domicilio / taller / ambos.
- Años de experiencia y radio aceptan únicamente números.
- Los errores de validación ahora se muestran campo por campo y en el cuadro de alerta.
- Se conserva la corrección previa para la subida de fotos con Expo FileSystem.

No requiere una migración nueva de base de datos.
