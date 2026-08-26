/*
 * =========================================================
 * ALLIANCE HARDWARE WEBSITE
 * DAWN ERP PROGRESS NETLIFY FUNCTION
 *
 * TEMPORARY TOKEN DIAGNOSTICS
 * =========================================================
 */

const crypto = require("crypto");

exports.handler = async function (event) {

  /*
   * =======================================================
   * ONLY ALLOW GET
   * =======================================================
   */

  if (event.httpMethod !== "GET") {

    return {
      statusCode: 405,

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        message: "Method not allowed."
      })
    };

  }


  /*
   * =======================================================
   * ENVIRONMENT VARIABLES
   * =======================================================
   */

  const dawnApiUrl =
    process.env.DAWN_API_URL;

  const dawnProgressToken =
    process.env.DAWN_PROGRESS_TOKEN;


  /*
   * =======================================================
   * SAFE TOKEN FINGERPRINT
   * =======================================================
   *
   * IMPORTANT:
   * The actual token is NEVER logged.
   *
   * Only the first 12 characters of its SHA-256 hash
   * are logged.
   *
   */

  const tokenFingerprint =
    dawnProgressToken
      ? crypto
          .createHash("sha256")
          .update(dawnProgressToken)
          .digest("hex")
          .slice(0, 12)
      : "MISSING";

  console.log(
    "DAWN token fingerprint:",
    tokenFingerprint
  );

  console.log(
    "DAWN API URL:",
    dawnApiUrl || "MISSING"
  );


  /*
   * =======================================================
   * CONFIGURATION CHECK
   * =======================================================
   */

  if (
    !dawnApiUrl ||
    !dawnProgressToken
  ) {

    console.error(
      "DAWN integration environment variables are missing."
    );

    return {
      statusCode: 500,

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        message:
          "DAWN progress service is not configured."
      })
    };

  }


  /*
   * =======================================================
   * REQUEST DAWN ERP PROGRESS
   * =======================================================
   */

  try {

    const response =
      await fetch(
        `${dawnApiUrl}/api/erp/progress`,
        {
          method: "GET",

          headers: {
            "Accept": "application/json",

            "x-dawn-progress-token":
              dawnProgressToken
          }
        }
      );


    /*
     * =====================================================
     * READ DAWN RESPONSE
     * =====================================================
     */

    const data =
      await response.json();


    /*
     * =====================================================
     * DAWN ERROR
     * =====================================================
     */

    if (!response.ok) {

      console.error(
        "DAWN progress request failed:",
        response.status
      );

      return {
        statusCode: response.status,

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          message:
            "Unable to retrieve DAWN ERP progress."
        })
      };

    }


    /*
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    return {

      statusCode: 200,

      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },

      body: JSON.stringify(data)

    };

  } catch (error) {

    console.error(
      "DAWN progress connection error:",
      error
    );

    return {

      statusCode: 502,

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        message:
          "DAWN ERP is currently unavailable."
      })

    };

  }

};