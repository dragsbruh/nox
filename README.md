# Nox - Webhook-as-a-Service with a Chat Experience

Nox is an open-source project that aims to provide a webhook-as-a-service with a chat experience similar to Discord. It is licensed under the GPL v3, making it free and open for contributions from the community. Nox is built using Node.js and Express, leveraging Supabase for its backend, and it's designed to offer an out-of-the-box solution for webhook management and communication.

## Features

- **Webhook Management:** Nox allows you to easily manage webhooks, making it simple to send and receive messages from various platforms.

- **Chat Experience:** With Nox, you can have a chat-like environment for your webhook interactions, making it more intuitive and developer-friendly.

- **Customization:** While Nox currently uses Supabase for its backend, we are actively working on adding support for custom databases, giving you more control over your data.

## Getting Started

To get started with Nox, follow these steps:

1. **Clone the Repository:**

   ```cmd
   git clone https://github.com/dragsbruh/nox.git
   ```

2. **Install Dependencies:**

   ```cmd
   cd nox
   npm install
   ```

3. **Configuration:**
   - Create a Supabase project and set up your database. Create two tables, "webhooks" and "messages".
   - Disable RLS for all tables (Will be updated soon) (insecure).
   - Create a `.env` and configure your Supabase credentials in the `.env` file.
   - If you're not sure how to do it, you can use `.env.template` file as a template for your `.env` file

4. **Run the Application:**

   ```cmd
   npm start
   ```

5. **Access Nox:**
   - The API runs on `http://localhost:6868`. For realtime (realtime messages), use `ws://localhost:6868`.
   - You can also specify a custom port and hostname in your `.env` file.

## Contributing

We welcome contributions from the community. I never managed open source projects so sorry if I do anything wrong!
Don't like where we are going? Fork the repository and feel free to modify it to suit your needs.

## License

Nox is licensed under the [GPL v3](LICENSE).

## Contact

Nope.

Thanks for using Nox!
