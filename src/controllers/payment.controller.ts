import axios from "axios";
import { Request, Response } from "express";
import { HOST, PAYPAL_API, PAYPAL_API_CLIENT, PAYPAL_API_SECRET } from "../config";

export const createOrder = async (req: Request, res: Response) => {
  if (!PAYPAL_API_CLIENT || !PAYPAL_API_SECRET) return;

  try {
    const order = {
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: "USD", value: "105.70" } }],
      application_context: {
        brand_name: "mycompany.com",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${HOST}/capture-order`,
        cancel_url: `${HOST}/cancel-order`,
      },
    };

    // Format the body
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");

    // Generate an access token
    const {
      data: { access_token },
    } = await axios.post("https://api-m.sandbox.paypal.com/v1/oauth2/token", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      auth: { username: PAYPAL_API_CLIENT, password: PAYPAL_API_SECRET },
    });

    // Make a request
    const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, order, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    return res.json(response.data);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export const captureOrder = async (req: Request, res: Response) => {
  if (!PAYPAL_API_CLIENT || !PAYPAL_API_SECRET) return;

  const { token } = req.query;

  try {
    await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${token}/capture`,
      {},
      {
        auth: { username: PAYPAL_API_CLIENT, password: PAYPAL_API_SECRET },
      }
    );

    res.redirect("/payed.html");
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const cancelPayment = (req: Request, res: Response) => res.redirect("/");
