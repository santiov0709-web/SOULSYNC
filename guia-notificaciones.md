# 🚀 Guía para Notificaciones "Nivel WhatsApp" (Durable)

Para que las notificaciones lleguen SIEMPRE (incluso si tu pareja cierra la app o bloquea el celular), necesitamos que sea la propia base de datos la que "avise" al sistema. Sigue estos 3 pasos:

### 1. Activar Webhooks en Supabase
1. Ve a tu proyecto en **Supabase**.
2. En el menú de la izquierda, busca abajo el icono de un "rayo" ⚡ que dice **"Database"**.
3. Haz clic en **"Webhooks"** (o "Alpha" bajo Database).
4. Dale al botón verde **"Enable Webhooks"** (si aún no está activado).

### 2. Crear el Webhook de SoulSync
1. Dale a **"Create a new Webhook"**.
2. **Name:** `soul-sync-alerts`
3. **Table:** `messages`
4. **Events:** Marca solo `INSERT`.
5. **Webhook Method:** `POST`
6. **URL:** Copia y pega esta exactamente: 
   `https://ntfy.sh/[TU_TOPIC]_push`
   *(IMPORTANTE: Reemplaza `[TU_TOPIC]` por el código secreto que te daré abajo).*

### 3. Configurar el Mensaje (HTTP Headers)
En la misma pantalla, baja hasta **"HTTP Headers"**:
- Dale a "Add Header".
- **Key:** `Title` | **Value:** `SoulSync: Nuevo Mensaje`
- Dale a "Add Header" otra vez.
- **Key:** `Priority` | **Value:** `high`

---

### Tu Código Secreto (Topic)
Usa esta URL para el paso anterior:
`https://ntfy.sh/soulsync_santiago_nicole_v2_push`

---

¡Haz esto y ahora los mensajes serán disparados desde los servidores de Supabase! Funcionará igual de bien que una app profesional.
