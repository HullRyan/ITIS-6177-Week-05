const express = require("express");

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mariadb = require("mariadb");

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "ITIS 6177 Week 05",
			version: "1.0.0",
			description:
				"A simple Express Library API, for ITIS 6177 Week 05 Assignment/Quiz",
		},
		host: "localhost:3002",
		basePath: "./",
	},
	apis: ["./app.js"],
};

const app = express();
const port = 3002;
const jsonParser = bodyParser.json();
const specs = swaggerJsDoc(options);

const pool = mariadb.createPool({
	host: "localhost",
	user: "root",
	password: "root",
	database: "sample",
	port: 3306,
	connectionLimit: 5,
});

app.use(cors());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /customers:
 *   get:
 *     description: Get all customers
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 *
 */
app.get("/customers", (req, res) => {
	pool
		.getConnection()
		.then((conn) => {
			conn
				.query("SELECT * FROM customer")
				.then((rows) => {
					res.set("Content-Type", "application/json");
					res.json(rows);
					conn.release();
				})
				.catch((err) => {
					conn.release();
					throw err;
				});
		})
		.catch((err) => {
			throw err;
		});
});

/**
 * @swagger
 * /customers/grade/{grade}:
 *   get:
 *     description: Get all customers by grade
 *     parameters:
 *       - name: grade
 *         description: grade
 *         in: path
 *         required: true
 *         type: integer
 *         minimum: 1
 *         maximum: 5
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 *       400:
 *         description: Invalid input
 */
app.get("/customers/grade/:grade", (req, res) => {
	console.log(JSON.stringify(req.params));
	//Sanitizing/Validating input
	if (isNaN(req.params.grade) || req.params.grade < 1 || req.params.grade > 5) {
		res.status(400).send("Invalid input");
		return;
	} else {
		req.params.grade = parseInt(req.params.grade);
	}

	pool
		.getConnection()
		.then((conn) => {
			conn
				.query("SELECT * FROM customer WHERE grade = ?", [req.params.grade])
				.then((rows) => {
					res.set("Content-Type", "application/json");
					res.json(rows);
					conn.release();
				})
				.catch((err) => {
					conn.release();
					throw err;
				});
		})
		.catch((err) => {
			throw err;
		});
});

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     description: Get all customers by grade
 *     parameters:
 *       - name: id
 *         description: id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 *       400:
 *         description: Invalid input
 */
app.get("/customers/:id", (req, res) => {
	console.log(JSON.stringify(req.params));
	//Sanitizing/Validating input
	if (req.params.id.length != 6) {
		res
			.status(400)
			.send("Invalid Input: Id length > 6: " + req.params.id.length);
		return;
	}

	pool
		.getConnection()
		.then((conn) => {
			conn
				.query("SELECT * FROM customer WHERE CUST_CODE = ?", [req.params.id])
				.then((rows) => {
					res.set("Content-Type", "application/json");
					res.json(rows);
					conn.release();
				})
				.catch((err) => {
					conn.release();
					throw err;
				});
		})
		.catch((err) => {
			throw err;
		});
});

/**
 * @swagger
 * /customers:
 *   post:
 *     description: Create a new customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               grade:
 *                 type: integer
 *               city:
 *                 type: string
 *               phone:
 *                 type: string
 *             required:
 *               - id
 *               - name
 *               - grade
 *               - city
 *               - phone
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 *       400:
 *         description: Invalid input
 */
app.post("/customers", jsonParser, (req, res) => {
	console.log(JSON.stringify(req.body));
	//Sanitizing/Validating input
	if (
		!req.body.id ||
		req.body.id.length != 6 ||
		!req.body.name ||
		!req.body.city ||
		!req.body.phone ||
		req.body.grade == undefined
	) {
		res.status(400).send("Invalid input");
		return;
	}

	// console.log(id);
	pool.getConnection().then((conn) => {
		conn
			.query("SELECT * FROM customer WHERE CUST_CODE = ?", [req.body.id])
			.then((rows) => {
				if (rows.length > 0) {
					res.status(400).send("Customer already exists");
					conn.release();
					return;
				} else {
					conn
						.query(
							"INSERT INTO customer (CUST_CODE, CUST_NAME, GRADE, PHONE_NO, CUST_CITY) VALUES (?, ?, ?, ?, ?)",
							[
								req.body.id,
								req.body.name,
								req.body.grade,
								req.body.phone,
								req.body.city,
							]
						)
						.then((rows) => {
							res.set("Content-Type", "application/json");
							rows["id"] = req.body.id;
							res.json(rows);
							conn.release();
						})
						.catch((err) => {
							conn.release();
							throw err;
						});
				}
			});
	});
});

/**
 * @swagger
 * /customers/{id}:
 *   delete:
 *     description: Delete a customer
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Customer ID
 *         type: string
 *         minLength: 6
 *         maxLength: 6
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Customer does not exist
 */
app.delete("/customers/:id", (req, res) => {
	console.log(JSON.stringify(req.params));
	//Sanitizing/Validating input
	if (req.params.id.length != 6) {
		res.status(400).send("Invalid input");
		return;
	}
	pool.getConnection().then((conn) => {
		conn
			.query("SELECT * FROM customer WHERE CUST_CODE = ?", [req.params.id])
			.then((rows) => {
				if (rows.length == 0) {
					res.status(400).send("Customer does not exist");
					conn.release();
					return;
				} else {
					conn
						.query("DELETE FROM customer WHERE CUST_CODE = ?", [req.params.id])
						.then((rows) => {
							res.set("Content-Type", "application/json");
							res.json(rows);
							conn.release();
						})
						.catch((err) => {
							conn.release();
							throw err;
						});
				}
			});
	});
});

/**
 * @swagger
 * /agents:
 *   get:
 *     description: Get all agents
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 */
app.get("/agents", (req, res) => {
	pool
		.getConnection()
		.then((conn) => {
			conn
				.query("SELECT * FROM agents")
				.then((rows) => {
					res.set("Content-Type", "application/json");
					res.json(rows);
					conn.release();
				})
				.catch((err) => {
					conn.release();
					throw err;
				});
		})
		.catch((err) => {
			throw err;
		});
});

/**
 * @swagger
 * /orders:
 *   get:
 *     description: Get all orders
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 */
app.get("/orders", (req, res) => {
	pool
		.getConnection()
		.then((conn) => {
			conn
				.query("SELECT * FROM orders")
				.then((rows) => {
					res.set("Content-Type", "application/json");
					res.json(rows);
					conn.release();
				})
				.catch((err) => {
					conn.release();
					throw err;
				});
		})
		.catch((err) => {
			throw err;
		});
});

//put
/**
 * @swagger
 * /customers/{id}:
 *   put:
 *     description: Fully update a customer
 *     parameters:
 *       - name: id
 *         description: Customer ID
 *         in: path
 *         required: true
 *         type: string
 *         minLength: 6
 *         maxLength: 6
 *         example: C00001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               grade:
 *                 type: integer
 *               city:
 *                 type: string
 *               phone:
 *                 type: string
 *             required:
 *               - name
 *               - grade
 *               - city
 *               - phone
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Customer does not exist
 */
app.put("/customers/:id", jsonParser, (req, res) => {
	console.log(JSON.stringify(req.body));
	//Sanitizing/Validating input
	if (
		!req.body.name ||
		!req.body.city ||
		!req.body.phone ||
		req.body.grade == undefined ||
		req.params.id.length != 6 ||
		req.body.grade < 1 ||
		req.body.grade > 5
	) {
		res.status(400).send("Invalid input");
		return;
	}

	pool.getConnection().then((conn) => {
		conn
			.query("SELECT * FROM customer WHERE CUST_CODE = ?", [req.params.id])
			.then((rows) => {
				if (rows.length == 0) {
					res.status(400).send("Customer does not exist");
					conn.release();
					return;
				} else {
					conn
						.query(
							"UPDATE customer SET CUST_NAME = ?, GRADE = ?, PHONE_NO = ?, CUST_CITY = ? WHERE CUST_CODE = ?",
							[
								req.body.name,
								req.body.grade,
								req.body.phone,
								req.body.city,
								req.params.id,
							]
						)
						.then((rows) => {
							res.set("Content-Type", "application/json");
							res.json(rows);
							conn.release();
						})
						.catch((err) => {
							conn.release();
							throw err;
						});
				}
			});
	});
});

//patch
/**
 * @swagger
 * /customers/{id}:
 *   patch:
 *     description: Partially update a customer
 *     parameters:
 *       - name: id
 *         description: Customer ID
 *         in: path
 *         required: true
 *         type: string
 *         minLength: 6
 *         maxLength: 6
 *         example: C00001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               grade:
 *                 type: integer
 *               city:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Customer does not exist
 */
app.patch("/customers/:id", jsonParser, (req, res) => {
	console.log(JSON.stringify(req.body));
	//Sanitizing/Validating input
	if (req.params.id.length != 6) {
		res.status(400).send("Invalid input");
		return;
	}

	pool.getConnection().then((conn) => {
		conn
			.query("SELECT * FROM customer WHERE CUST_CODE = ?", [req.params.id])
			.then((rows) => {
				if (rows.length == 0) {
					res.status(400).send("Customer does not exist");
					conn.release();
					return;
				} else {
					let query = "UPDATE customer SET ";
					let values = [];
					if (req.body.name) {
						query += "CUST_NAME = ?, ";
						values.push(req.body.name);
					}
					if (req.body.grade != undefined) {
						query += "GRADE = ?, ";
						values.push(req.body.grade);
					}
					if (req.body.phone) {
						query += "PHONE_NO = ?, ";
						values.push(req.body.phone);
					}
					if (req.body.city) {
						query += "CUST_CITY = ?, ";
						values.push(req.body.city);
					}
					query = query.slice(0, -2); // remove the last comma and space
					query += " WHERE CUST_CODE = ?";
					values.push(req.params.id);

					conn
						.query(query, values)
						.then((rows) => {
							res.set("Content-Type", "application/json");
							res.json(rows);
							conn.release();
						})
						.catch((err) => {
							conn.release();
							throw err;
						});
				}
			});
	});
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
