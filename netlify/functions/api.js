import express, { Router } from "express";
import serverless from "serverless-http";
import axios from "axios";
import bodyParser from "body-parser";

const api = express();
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: true }));

const REDIRECT_URI = "https://lktoken.netlify.app/api/callback";

const router = Router();

router.get("/auth", (req, res) => {
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=r_organization_social`;
  res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
  const authCode = req.query.code;

  try {
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code: authCode,
          redirect_uri: REDIRECT_URI,
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    res.send(`Token d'accès obtenu : ${accessToken}`);
  } catch (error) {
    console.error("Erreur lors de l'obtention du token :", error);
    res.status(500).send("Erreur d'authentification.");
  }
});
api.use("/api/", router);

export const handler = serverless(api);
