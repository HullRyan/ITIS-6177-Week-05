const express = require("express");

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
const bodyParser = require('body-parser')
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
const jsonParser = bodyParser.json()
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
 * /customers/{grade}:
 *   get:
 *     description: Get all customers by grade
 *     parameters:
 *       - name: grade
 *         description: grade
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 *       400:
 *         description: Invalid input
 */
app.get("/customers/:grade", (req, res) => {
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
		!req.body.name ||
		!req.body.city ||
		!req.body.phone ||
		(req.body.grade == undefined)
	) {
		res.status(400).send("Invalid input");
		return;
	}

	id = "C" + req.body.id;
	// console.log(id);
	pool
		.getConnection()
		.then((conn) => {
			conn.query("SELECT * FROM customer WHERE CUST_CODE = ?", [id]).then((rows) => {
				if (rows.length > 0) {
					res.status(400).send("Customer already exists");
					conn.release();
					return;
				} else {
					conn
						.query(
							"INSERT INTO customer (CUST_CODE, CUST_NAME, GRADE, PHONE_NO, CUST_CITY) VALUES (?, ?, ?, ?, ?)",
							[id, req.body.name, req.body.grade, req.body.phone, req.body.city]
						)
						.then((rows) => {
							res.set("Content-Type", "application/json");
							rows["id"] = id;
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

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
