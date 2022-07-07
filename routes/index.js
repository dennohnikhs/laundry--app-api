const express = require("express");
const laundryRoutes = require("./router.js");
const router = express.Router();

/**
 * @openapi
 * /:
 *  get:
 *     tags:
 *     - Healthcheck
 *     description: Returns API operational status
 *     responses:
 *          '200':
 *           description: A user object.
 *           content:
 *             application/json:
 *               example:
 *                  {
 *                    success: true,
 *                      courses: [
 *                        {
 *                          id: 1,
 *                          name: 'Mechatronics'
 *                        },
 *                        {
 *                          id: 2,
 *                          name: 'Electronics'
 *                        }
 *                      ]
 *                  }

*/

router.get("/", (req, res) => {
  res.send({
    status: "Ok",
    message: "Server running...",
  });
});

router.use("/laundry/v1/api", laundryRoutes);

module.exports = router;
