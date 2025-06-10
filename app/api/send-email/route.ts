import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    // Verificar que la API key esté configurada
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY no está configurada")
      return NextResponse.json(
        {
          success: false,
          error: "Servicio de email no configurado",
        },
        { status: 500 },
      )
    }

    const { to, customerName, ticketType, ticketPrice, seatNumber } = await request.json()

    // Validar campos requeridos
    if (!to || !customerName || !ticketType || !ticketPrice || !seatNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan campos requeridos",
        },
        { status: 400 },
      )
    }

    console.log("Enviando email a:", to)

    // Enviar el email usando Resend
    const { data, error } = await resend.emails.send({
      from: "Concierto Tickets <onboarding@resend.dev>", // Dominio de prueba de Resend
      to: [to],
      subject: "🎫 Confirmación de Compra - Tu Boleto está Listo",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background: linear-gradient(135deg, #ff416c, #ff4b2b); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { 
              background: #f9f9f9; 
              padding: 30px; 
              border-radius: 0 0 10px 10px; 
            }
            .ticket-info { 
              background: white; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              border-left: 4px solid #ff416c; 
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              color: #666; 
              font-size: 14px; 
            }
            .highlight { 
              color: #ff416c; 
              font-weight: bold; 
            }
            .qr-section {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: center;
              border: 2px dashed #ff416c;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎵 ¡Compra Confirmada! 🎵</h1>
              <p>Tu boleto para el concierto está listo</p>
            </div>
            <div class="content">
              <h2>Hola ${customerName},</h2>
              <p>¡Gracias por tu compra! Tu boleto ha sido confirmado exitosamente.</p>
              
              <div class="ticket-info">
                <h3>📋 Detalles de tu Boleto</h3>
                <p><strong>Nombre:</strong> <span class="highlight">${customerName}</span></p>
                <p><strong>Email:</strong> ${to}</p>
                <p><strong>Tipo de Boleto:</strong> <span class="highlight">${ticketType}</span></p>
                <p><strong>Precio:</strong> <span class="highlight">$${ticketPrice}</span></p>
                <p><strong>Asiento:</strong> <span class="highlight">${seatNumber}</span></p>
              </div>

              <div class="qr-section">
                <h3>🎫 Tu Boleto Digital</h3>
                <p><strong>Código de Boleto:</strong> <span class="highlight">TICKET-${seatNumber}-${Date.now().toString().slice(-6)}</span></p>
                <p style="font-size: 12px; color: #666;">Presenta este email en la entrada del evento</p>
              </div>

              <h3>📍 Información del Evento</h3>
              <p><strong>Evento:</strong> Concierto Especial 2024</p>
              <p><strong>Fecha:</strong> Sábado, 15 de Junio 2024</p>
              <p><strong>Hora:</strong> 8:00 PM</p>
              <p><strong>Lugar:</strong> Arena Principal</p>
              <p><strong>Dirección:</strong> Av. Principal 123, Ciudad</p>

              <h3>📝 Instrucciones Importantes</h3>
              <ul>
                <li>✅ Llega al menos 30 minutos antes del evento</li>
                <li>✅ Presenta este email junto con tu identificación</li>
                <li>✅ Guarda este email como comprobante</li>
                <li>❌ No se permiten reembolsos</li>
                <li>❌ Prohibido el ingreso de bebidas y alimentos externos</li>
              </ul>

              <div class="footer">
                <p>¡Nos vemos en el concierto! 🎤</p>
                <p>Si tienes alguna pregunta, contáctanos en: <a href="mailto:soporte@concierto.com">soporte@concierto.com</a></p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #999;">
                  Este es un email automático, por favor no respondas a este mensaje.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error("Error de Resend:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Error al enviar el email",
          details: error.message || "Error desconocido",
        },
        { status: 500 },
      )
    }

    console.log("Email enviado exitosamente:", data)
    return NextResponse.json({
      success: true,
      data,
      message: "Email enviado correctamente",
    })
  } catch (error) {
    console.error("Error en API de email:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
