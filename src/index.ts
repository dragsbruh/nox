import supabase from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import parser from "body-parser";
import express from "express";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";

console.log("Starting");

dotenv.config();

const PORT: number = (process.env.PORT as unknown as number) || 6868;
const client: supabase.SupabaseClient = supabase.createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_KEY
);

class CSMap {
	// Using custom Map() implementation because Map() implementation didn't work on my machine (or I'm a bad programmer)
	private data = {};
	public has(key: string): boolean {
		return this.data.hasOwnProperty(key);
	}
	public get(key: string): any {
		if (!this.has(key)) {
			throw new Error("No such key in map: " + key);
		} else {
			return this.data[key];
		}
	}
	public set(key: string, value: any): any {
		if (!this.has(key)) {
			this.data[key] = value;
			return false;
		} else {
			this.data[key] = value;
			return true;
		}
	}
	public delete(key: string): boolean {
		if (!this.has(key)) {
			return false;
		} else {
			delete this.data[key];
			return true;
		}
	}
	public forEach(cb: CallableFunction) {
		for (var key in this.data) {
			cb(key);
		}
	}
}

const app = express();
const subscriptions = new CSMap();
const server = http.createServer(app);
const wss = new WebSocketServer({ server: server });

app.use(parser.json());

const validUUIDv4 = (str) =>
	/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89aAbB][\da-f]{3}-[\da-f]{12}$/.test(
		str
	);

app.post("/api/create", async (req, res) => {
	if (req.body.authorization == undefined) {
		res.status(401);
		res.json({
			error: "Please provide authorization token",
		});
		return;
	} else if (req.body.authorization !== process.env.SECRET_KEY) {
		res.status(401);
		res.json({
			error: "Invalid authorization token",
		});
		return;
	}
	let data = {
		id: uuidv4(),
		messages: [],
	};
	let _,
		error = await client.from("webhooks").insert(data);
	if (error["statusText"] === "Created") {
		error = null;
	}
	res.json({
		error: error,
		hook: data.id,
	});
});
app.post("/api/delete", async (req, res) => {
	if (req.body.authorization == undefined) {
		res.status(401);
		res.json({
			error: "Please provide authorization token",
		});
		return;
	} else if (req.body.authorization !== process.env.SECRET_KEY) {
		res.status(401);
		res.json({
			error: "Invalid authorization token",
		});
		return;
	}
	if (req.body.id == undefined) {
		res.status(400);
		res.json({
			error: "Please provide hook ID",
		});
		return;
	}
	if (!validUUIDv4(req.body.id)) {
		res.status(400);
		res.json({
			error: "Improper hook ID",
		});
		return;
	}

	let error = await client.from("webhooks").delete().eq("id", req.body.id);
	res.json({
		error: null, // TODO: this
	});
});
app.post("/api/clear", async (req, res) => {
	if (req.body.authorization == undefined) {
		res.status(401);
		res.json({
			error: "Please provide authorization token",
		});
		return;
	} else if (req.body.authorization !== process.env.SECRET_KEY) {
		res.status(401);
		res.json({
			error: "Invalid authorization token",
		});
		return;
	}
	if (req.body.id == undefined) {
		res.status(400);
		res.json({
			error: "Please provide hook ID",
		});
		return;
	}
	if (!validUUIDv4(req.body.id)) {
		res.status(400);
		res.json({
			error: "Improper hook ID",
		});
		return;
	}
	let result = await client
		.from("webhooks")
		.select("*")
		.eq("id", req.body.id)
		.single();
	let error = null;
	if (result.error !== null) {
		error = result.error.message;
	}
	if (result.data === null) {
		res.send({
			data: null,
			error:
				"Error getting messages. Does the webhook exist? Hint: " +
				error,
		});
		return;
	}
	result.data.messages.forEach(async (message) => {
		let error = await client.from("messages").delete().eq("id", message);
	});
	const { error: updateError } = await client
		.from("webhooks")
		.update({ messages: [] })
		.eq("id", req.body.id);
	if (updateError) {
		res.status(500);
		res.json({ error: "Error clearing data: " + updateError });
		return;
	}
	res.json({ error: null });
});
app.get("/api/messages", async (req, res) => {
	if (req.body.id == undefined) {
		res.status(400);
		res.json({
			error: "Please provide hook ID",
		});
		return;
	}
	if (!validUUIDv4(req.body.id)) {
		res.status(400);
		res.json({
			error: "Improper hook ID",
		});
		return;
	}
	let result = await client
		.from("webhooks")
		.select("*")
		.eq("id", req.body.id)
		.single();
	let error = null;
	if (result.error !== null) {
		error = result.error.message;
	}
	if (result.data === null) {
		res.send({
			data: null,
			error: "Error fetching messages. Does the webhook exist?",
		});
	} else {
		res.send({
			data: result.data.messages,
			error: error,
		});
	}
});
app.get("/api/message", async (req, res) => {
	if (req.body.id == undefined) {
		res.status(400);
		res.json({
			error: "Please provide message ID",
		});
		return;
	}
	let result = await client
		.from("messages")
		.select("*")
		.eq("id", req.body.id)
		.single();
	let error = null;
	if (result.error !== null) {
		error = result.error.message;
	}
	res.json({
		data: null || result.data,
		error: error,
	});
});
app.post("/api/message", async (req, res) => {
	if (req.body.authorization == undefined) {
		res.status(401);
		res.json({
			error: "Please provide authorization token",
		});
		return;
	} else if (req.body.authorization !== process.env.SECRET_KEY) {
		res.status(401);
		res.json({
			error: "Invalid authorization token",
		});
		return;
	}
	if (req.body.id == undefined) {
		res.status(400);
		res.json({
			error: "Please provide hook ID",
		});
		return;
	}
	if (req.body.content == undefined) {
		res.status(400);
		res.json({
			error: "Please provide content to send",
		});
		return;
	}
	if (req.body.author == undefined) {
		res.status(400);
		res.json({
			error: "Please provide an author name to send",
		});
		return;
	}
	if (!validUUIDv4(req.body.id)) {
		res.status(400);
		res.json({
			error: "Improper hook ID",
		});
		return;
	}
	let data = {
		id: uuidv4(),
		content: req.body.content,
		time: Math.round(Date.now() / 1000),
		author: req.body.author,
		hook: req.body.id,
	};
	const { data: messageData, error: fetchErrorMsg } = await client
		.from("messages")
		.insert(data);
	if (fetchErrorMsg) {
		res.status(500);
		res.json({
			error: "Error setting message data: " + fetchErrorMsg.message,
		});
		return;
	}
	const { data: existingData, error: fetchErrorHook } = await client
		.from("webhooks")
		.select("messages")
		.eq("id", req.body.id)
		.single();
	if (fetchErrorHook) {
		res.status(500);
		res.json({
			error: "Error fetching existing data: " + fetchErrorHook.message,
		});
		return;
	}
	let messagesArray = existingData ? existingData.messages || [] : [];

	messagesArray.push(data.id);

	const { data: updatedData, error: updateError } = await client
		.from("webhooks")
		.update({ messages: messagesArray })
		.eq("id", req.body.id);
	if (updateError) {
		res.status(500);
		res.json({ error: "Error updating data: " + updateError });
		return;
	}
	subscriptions.forEach((identifier) => {
		let subscriber = subscriptions.get(identifier);
		if (subscriber.hook === data.hook) {
			subscriber.ws.send(
				JSON.stringify({
					data: data,
				})
			);
		}
	});

	res.json({ data: data, error: null });
});

wss.on("connection", (ws) => {
	const identifier = uuidv4();
	ws.on("message", (msg) => {
		let data: any;
		try {
			data = JSON.parse(msg.toString());
		} catch (e) {
			ws.send(
				JSON.stringify({
					error: "JSON parsing error: " + e.toString(),
				})
			);
			return;
		}
		if (!data.hasOwnProperty("command")) {
			ws.send(
				JSON.stringify({
					error: "Please provide a command.",
				})
			);
			return;
		}
		if (data.command === "unsubscribe") {
			if (subscriptions.has(identifier)) {
				subscriptions.delete(identifier);
				ws.send(JSON.stringify({ error: null }));
			} else {
				ws.send(
					JSON.stringify({
						error: "You are not subscribed to anything.",
					})
				);
			}
			return;
		}
		if (!data.hasOwnProperty("argument")) {
			ws.send(
				JSON.stringify({
					error: "Please provide an argument.",
				})
			);
			return;
		}
		if (data.command === "subscribe") {
			if (subscriptions.has(identifier)) {
				ws.send(
					JSON.stringify({
						error:
							"You are already subscribed to hook " +
							subscriptions.get(identifier).hook,
					})
				);
				return;
			} else if (!validUUIDv4(data.argument)) {
				ws.send(
					JSON.stringify({
						error: "Invalid UUID for hook",
					})
				);
				return;
			} else {
				subscriptions.set(identifier, {
					hook: data.argument,
					ws: ws,
				});
				ws.send(
					JSON.stringify({
						error: null,
					})
				);
			}
			return;
		}
	});
	ws.on("close", () => {
		if (subscriptions.has(identifier)) {
			subscriptions.delete(identifier);
		}
	});
});

server.listen(PORT, () => {
	console.log("listening on port " + PORT);
});
