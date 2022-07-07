const express = require("express");
const { connection, executeQuery } = require("../database/database");
const { validateMany } = require("../validator");
const router = express.Router();

router.get("/test", async (req, res) => {
  res.json({ name: "This is a test" });
});

router.post("/book", async function (req, res) {
  let book = req.body.book;
  let full_name = book.full_name;
  let phone_number = book.phone_number;
  let location = book.location;
  let number_baskets = book.number_baskets;
  let pick_from_home = book.pick_from_home;
  let customer_id = 0;

  const valueObj = {
    full_name,
    phone_number,
    location,
    number_baskets,
    pick_from_home,
  };

  const rulesObj = {
    full_name: ["required"],
    phone_number: ["required", "phone"],
    location: ["required"],
    number_baskets: ["required", "min:0"],
    pick_from_home: ["required", "in:1,0"],
  };

  let validationResult = await validateMany(valueObj, rulesObj);

  if (!validationResult.success) {
    res.send(validationResult);
    return;
  }

  // CHECK IF CUSTOMER EXIST
  let result = await executeQuery(
    "SELECT * FROM customers WHERE phone_number=?",
    [phone_number]
  );

  if (result && result.length > 0) {
    customer_id = result[0].id;
  } else {
    await executeQuery(
      "INSERT INTO customers (name,location,phone_number) VALUES(?,?,?)",
      [full_name, location, phone_number]
    );
    let result = await executeQuery(
      "SELECT * FROM customers WHERE phone_number=?",
      [phone_number]
    );
    customer_id = result[0].id;
  }

  //INSERT INTO ORDERS
  await executeQuery(
    "INSERT INTO orders (customer_id,number_baskets,amount,pick_from_home) VALUES(?,?,?,?)",
    [customer_id, number_baskets, number_baskets * 300, pick_from_home]
  );

  result = await executeQuery(
    "SELECT * FROM orders WHERE customer_id=? ORDER BY created_at DESC LIMIT 1",
    [customer_id]
  );

  res.send({
    success: true,
    message: "Order made successfully",
    order: result[0],
  });
});

/**
 * @openapi
 * /laundry/v1/api/admins:
 *  get:
 *     tags:
 *     - List Admins
 *     description: Returns  a list of admins
 *     responses:
 *          '200':
 *           content:
 *             application/json:
 *               example:
 *                  {
 *                    success: true,
 *                      admins: [
 *                        {
 *                          id: 1,
 *                          name: 'Rashon Kiptoo',
 *                          email: 'rashon@gmail.com',
 *                          username: 'rashon',
 *                          created_at: '2022-06-07 2.00pm'
 *                        },
 *                      ]
 *                  }
 */

router.get("/admins", async (req, res) => {
  let result = await executeQuery(
    "SELECT id,name,email,username,created_at FROM admins ORDER BY id DESC",
    []
  );

  res.json({ success: true, message: "Admins list", admins: result });
});

/**
 * @openapi
 * /laundry/v1/api/admins:
 *  post:
 *     tags:
 *     - Create Admin
 *     description: Creates a new admin
 *     requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              admin:
 *                type: object
 *          example: {"admin":{"name":"Rashon","email":"rashon@gmail.com","username":"rashon","password":"*****","phone_number":"0702820251"}}
 *
 *     responses:
 *          '200':
 *           content:
 *             application/json:
 *               example:
 *                  {
 *                    success: true,
 *                    message: "Admin added successfully",
 *                  }
 */
router.post("/admins/add", async (req, res) => {
  let admin = req.body.admin;
  let name = admin.name;
  let email = admin.email;
  let username = admin.username;
  let password = admin.password;
  let phone_number = admin.phone_number;

  const valueObj = {
    name,
    email,
    username,
    password,
    phone_number,
  };

  const rulesObj = {
    name: ["required"],
    email: ["required", "email", "unique:email,admins"],
    username: ["required", "min:3", "max:10", "unique:username,admins"],
    password: ["required", "password"],
    phone_number: ["required", "phone", "unique:phone_number,admins"],
  };

  let validationResult = await validateMany(valueObj, rulesObj);

  if (!validationResult.success) {
    res.send(validationResult);
    return;
  }

  await executeQuery(
    "INSERT INTO admins(name,email,phone_number,username,password) VALUES(?,?,?,?,?)",
    [name, email, phone_number, username, password]
  );

  res.json({ success: true, message: "Admin added successfully" });
});

router.post("/admins/:id/edit", async (req, res) => {
  let id = req.params.id;
  let admin = req.body.admin;
  let name = admin.name;
  let email = admin.email;
  let username = admin.username;
  let phone_number = admin.phone_number;

  const valueObj = {
    id,
    name,
    email,
    username,
    phone_number,
  };

  const rulesObj = {
    id: ["required", "number", "exists:id,admins"],
    name: ["required"],
    email: ["required", "email", `unique:email,admins,${id}`],
    username: ["required", "min:3", "max:10", `unique:username,admins,${id}`],
    phone_number: ["required", "phone", `unique:phone_number,,${id}`],
  };

  let validationResult = await validateMany(valueObj, rulesObj);

  if (!validationResult.success) {
    res.send(validationResult);
    return;
  }

  await executeQuery(
    "UPDATE admins SET name=?,email=?,phone_number=?,username=?,password=? WHERE id=?",
    [name, email, phone_number, username, id]
  );

  res.json({ success: true, message: "Admin edited successfully" });
});
router.get("/*", async (req, res) => {
  res.json({ success: false, message: "Route not found" });
});

router.post("/*", async (req, res) => {
  res.json({ success: false, message: "Route not found" });
});

module.exports = router;
