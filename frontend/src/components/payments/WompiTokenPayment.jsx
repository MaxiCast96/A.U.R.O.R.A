import React, { useState } from "react";
import API_CONFIG, { buildApiUrl } from "../../config/api";

const WompiTokenPayment = () => {
  const [cardToken, setCardToken] = useState(null);

  const handleTokenizeCard = async () => {
    try {
      const response = await fetch("https://sandbox.wompi.co/v1/tokens/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: "4242424242424242",
          exp_month: "08",
          exp_year: "28",
          cvc: "123",
          card_holder: "Pedro Perez"
        })
      });

      const data = await response.json();
      console.log("Token de tarjeta:", data);
      setCardToken(data.data.id); // ejemplo: tok_test_12345
    } catch (error) {
      console.error("Error tokenizando:", error);
    }
  };

  const handlePay = async () => {
    if (!cardToken) {
      alert("Primero tokeniza la tarjeta");
      return;
    }

    try {
      // Llamás a TU backend (no directamente a Wompi)
      const response = await fetch(buildApiUrl("/wompi/pay"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: cardToken,
          amount: 50000, // en centavos: 500.00 = 50000
          currency: "COP"
        })
      });

      const data = await response.json();
      console.log("Respuesta backend:", data);
    } catch (error) {
      console.error("Error en pago:", error);
    }
  };

  return (
    <div>
      <button onClick={handleTokenizeCard}>Tokenizar tarjeta</button>
      <button onClick={handlePay}>Pagar</button>
    </div>
  );
};

export default WompiTokenPayment;
