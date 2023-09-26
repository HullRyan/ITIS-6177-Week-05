const express = require("express");

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

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
		basePath: "/",
	},
	apis: ["./index.js"],
};

const specs = swaggerJsDoc(options);

const app = express();
const port = 3002;

const mariadb = require("mariadb");
const pool = mariadb.createPool({
	host: "localhost",
	user: "root",
	password: "root",
	database: "sample",
	port: 3306,
	connectionLimit: 5,
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /customers:
 *    get:
 *      description: Get all customers
 *    responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
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
 *    get:
 *      description: Get all customers by grade
 *      parameters:
 *         -  name: grade
 *            description: grade
 *            in: path
 *            required: true
 *            type: integer
 *      responses:
 *        200:
 *          description: Success
 *        500:
 *          description: Internal Server Error
 */
app.get("/customers/:grade", (req, res) => {
	console.log(JSON.stringify(req.params));
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
 * /agents:
 *    get:
 *      description: Get all agents
 *      responses:
 *        200:
 *          description: Success
 *        500:
 *          description: Internal Server Error
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
 *    get:
 *      description: Get all orders
 *      responses:
 *        200:
 *          description: Success
 *        500:
 *          description: Internal Server Error
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
