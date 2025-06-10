"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface Ticket {
  type: string
  price: number
}

interface UserData {
  email: string
  ticket: Ticket | null
  seat: string
}

export default function TicketApp() {
  const [currentSection, setCurrentSection] = useState("login")
  const [userData, setUserData] = useState<UserData>({
    email: "",
    ticket: null,
    seat: "",
  })
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [emailStatus, setEmailStatus] = useState<"pending" | "success" | "error" | null>(null)

  // Generate seats A1-E5
  const generateSeats = () => {
    const seats = []
    const rows = ["A", "B", "C", "D", "E"]
    for (const row of rows) {
      for (let col = 1; col <= 5; col++) {
        seats.push(`${row}${col}`)
      }
    }
    return seats
  }

  const sendConfirmationEmail = async (userData: UserData, cardName: string) => {
    try {
      console.log("Intentando enviar email a:", userData.email)
      setEmailStatus("pending")

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: userData.email,
          customerName: cardName,
          ticketType: userData.ticket?.type,
          ticketPrice: userData.ticket?.price,
          seatNumber: userData.seat,
        }),
      })

      // Verificar si la respuesta es válida
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error en respuesta del API:", errorText)
        throw new Error(`Error del servidor: ${response.status}`)
      }

      const result = await response.json()
      console.log("Respuesta del API de email:", result)

      if (result.success) {
        setEmailStatus("success")
        return result
      } else {
        setEmailStatus("error")
        throw new Error(result.error || "Error desconocido al enviar email")
      }
    } catch (error) {
      setEmailStatus("error")
      console.error("Error enviando email:", error)
      throw error
    }
  }

  const [seats] = useState(generateSeats())
  const [unavailableSeats] = useState(["A3", "B2", "C4", "D1", "E5"]) // Mock unavailable seats

  const ticketTypes = [
    { type: "VIP", price: 150 },
    { type: "General", price: 80 },
    { type: "Balcón", price: 100 },
  ]

  const handleLogin = () => {
    if (formData.email && formData.password) {
      setUserData((prev) => ({ ...prev, email: formData.email }))
      setCurrentSection("tickets")
    } else {
      alert("Completa email y contraseña")
    }
  }

  const handleTicketSelect = (ticket: Ticket) => {
    setUserData((prev) => ({ ...prev, ticket }))
    setCurrentSection("seats")
  }

  const handleSeatSelect = (seat: string) => {
    if (unavailableSeats.includes(seat)) return
    setUserData((prev) => ({ ...prev, seat }))
  }

  const handleContinueToCheckout = () => {
    if (userData.seat) {
      setCurrentSection("checkout")
    }
  }

  const handlePayment = async () => {
    if (!formData.cardName) {
      alert("Por favor completa todos los campos")
      return
    }

    try {
      setIsProcessing(true)

      // Simular procesamiento de pago
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Intentar enviar email de confirmación
      try {
        await sendConfirmationEmail(userData, formData.cardName)
      } catch (emailError) {
        console.warn("Error al enviar email, pero el pago fue exitoso:", emailError)
        // Continuar aunque falle el email
      }

      setCurrentSection("confirmation")
    } catch (error) {
      console.error("Error en el pago:", error)
      alert("Error al procesar el pago. Inténtalo de nuevo.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLogout = () => {
    setUserData({ email: "", ticket: null, seat: "" })
    setFormData({
      email: "",
      password: "",
      cardName: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
    })
    setEmailStatus(null)
    setCurrentSection("login")
  }

  const getSeatClass = (seat: string) => {
    if (unavailableSeats.includes(seat)) return "unavailable"
    if (userData.seat === seat) return "selected"
    return "available"
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage:
          "url('https://imagenes.20minutos.es/files/image_1920_1080/uploads/imagenes/2023/04/11/la-malaguena-ana-mena.jpeg')",
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Login Section */}
      {currentSection === "login" && (
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-0 relative z-10">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold text-white text-center mb-6">Iniciar Sesión</h1>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="bg-white/20 border-0 text-white placeholder:text-white/70"
              />
              <Input
                type="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                className="bg-white/20 border-0 text-white placeholder:text-white/70"
              />
              <Button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
              >
                Iniciar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tickets Section */}
      {currentSection === "tickets" && (
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-0 relative z-10">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-2">Bienvenido</h2>
            <p className="text-white/80 text-center mb-6">{userData.email}</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {ticketTypes.map((ticket) => (
                <Card key={ticket.type} className="bg-white/10 border-0">
                  <CardContent className="p-5 text-center">
                    <h3 className="text-white font-semibold mb-2">{ticket.type}</h3>
                    <p className="text-white/80 mb-4">${ticket.price}</p>
                    <Button
                      onClick={() => handleTicketSelect(ticket)}
                      className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                    >
                      Seleccionar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-white/30 text-white hover:bg-white/10"
            >
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Seats Section */}
      {currentSection === "seats" && (
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-0 relative z-10">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Selecciona tu Asiento</h2>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {seats.map((seat) => (
                <button
                  key={seat}
                  onClick={() => handleSeatSelect(seat)}
                  className={`p-3 text-sm font-medium rounded transition-colors ${
                    getSeatClass(seat) === "available"
                      ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                      : getSeatClass(seat) === "selected"
                        ? "bg-yellow-500 text-black"
                        : "bg-white/20 text-white/50 cursor-not-allowed"
                  }`}
                  disabled={unavailableSeats.includes(seat)}
                >
                  {seat}
                </button>
              ))}
            </div>
            {userData.seat && (
              <Button
                onClick={handleContinueToCheckout}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
              >
                Continuar al Pago
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Checkout Section */}
      {currentSection === "checkout" && (
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-0 relative z-10">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-4">Pago</h2>
            <div className="bg-white/10 p-4 rounded mb-6">
              <p className="text-white text-sm">
                <strong>Email:</strong> {userData.email}
                <br />
                <strong>Ticket:</strong> {userData.ticket?.type} - ${userData.ticket?.price}
                <br />
                <strong>Asiento:</strong> {userData.seat}
              </p>
            </div>
            <div className="space-y-4">
              <Input
                placeholder="Nombre en la tarjeta"
                value={formData.cardName}
                onChange={(e) => setFormData((prev) => ({ ...prev, cardName: e.target.value }))}
                className="bg-white/20 border-0 text-white placeholder:text-white/70"
              />
              <Input
                placeholder="Número de tarjeta"
                value={formData.cardNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, cardNumber: e.target.value }))}
                className="bg-white/20 border-0 text-white placeholder:text-white/70"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="MM/AA"
                  value={formData.cardExpiry}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cardExpiry: e.target.value }))}
                  className="bg-white/20 border-0 text-white placeholder:text-white/70"
                />
                <Input
                  placeholder="CVC"
                  value={formData.cardCvc}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cardCvc: e.target.value }))}
                  className="bg-white/20 border-0 text-white placeholder:text-white/70"
                />
              </div>
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:opacity-70"
              >
                {isProcessing ? "Procesando y enviando email..." : "Pagar y Confirmar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Section */}
      {currentSection === "confirmation" && (
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-0 relative z-10">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">¡Compra Exitosa!</h2>
            <div className="bg-white/10 p-4 rounded mb-6">
              <p className="text-white text-sm">
                <strong>✅ Confirmación para:</strong> {userData.email}
                <br />
                <strong>🎫 Ticket:</strong> {userData.ticket?.type} - ${userData.ticket?.price}
                <br />
                <strong>💺 Asiento:</strong> {userData.seat}
                <br />
                <br />
                {emailStatus === "success" ? (
                  <span className="text-green-300">
                    📧 ¡Email de confirmación enviado! Revisa tu bandeja de entrada
                  </span>
                ) : emailStatus === "error" ? (
                  <span className="text-yellow-300">⚠️ No se pudo enviar el email, pero tu compra está confirmada</span>
                ) : emailStatus === "pending" ? (
                  <span className="text-blue-300">📤 Enviando email de confirmación...</span>
                ) : (
                  <span className="text-green-300">✅ Tu compra ha sido registrada</span>
                )}
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-white/30 text-white hover:bg-white/10"
            >
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
