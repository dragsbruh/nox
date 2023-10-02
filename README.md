# Nox - Webhook-as-a-Service with a Chat Experience

v1.2.0-beta

Nox is an open-source project designed to provide a webhook-as-a-service with a chat experience similar to Discord. It is licensed under the GPL v3, offering a free and open platform for contributions from the community. Nox is built using Node.js and Express and utilizes Supabase for its backend. It's designed to be an out-of-the-box solution for webhook management and communication.

PLEASE NOTE: This is currently highly insecure because you can delete the entire webhook with auth key which is required for every interaction that includes updates and inserts.

## Features

- **Webhook Management:** Nox simplifies webhook management, making it easy to send and receive messages from various platforms.

- **Chat Experience:** With Nox, you can create a chat-like environment for your webhook interactions, making it more intuitive and developer-friendly.

- **Customization:** While Nox currently uses Supabase for its backend, we are actively working on adding support for custom databases, providing you with more control over your data.

## Getting Started

To start using Nox, follow these steps:

1. **Clone the Repository:**

   ```shell
   git clone https://github.com/dragsbruh/nox.git
   ```

2. **Install Dependencies:**

   ```shell
   cd nox
   npm install
   ```

3. **Configuration:**

   - Create a Supabase project and set up your database. Create two tables, "webhooks" and "messages".
   - Disable RLS (Row-Level Security) for all tables (Note: This is insecure and will be updated soon).
   - Create the following columns in the "webhooks" table:
     - id: uuid
     - messages: json
   - Create the following columns in the "messages" table:
     - id: uuid
     - content: text
     - time: int8
     - author: text
     - hook: uuid
   - Create a `.env` file and configure your Supabase credentials in it.
   - If you're not sure how to do it, you can use the `.env.template` file as a template for your `.env` file.

4. **Run the Application:**

   ```shell
   npm start
   ```

5. **Access Nox:**

   - The API runs on `http://localhost:6868`. For real-time messages, use `ws://localhost:6868`.
   - You can also specify a custom port and hostname in your `.env` file.

## Contributing

We welcome contributions from the community. If you have ideas or improvements, feel free to fork the repository and make the necessary changes.

## License

Nox is licensed under the [GPL v3](LICENSE).

## Contact

Feel free to reach out if you have any questions or need assistance.

Thanks for using Nox!
