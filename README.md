Shipper Chat MVP
A real-time chat application built with Next.js, WebSockets, and PostgreSQL. Features JWT authentication, online user tracking, and chat session management.
# Clone the repository
git clone https://github.com/molla-12/shipper-chat-mvp
cd shipper-chat-mvp

# Install dependencies
npm install
# Set up the database
npx prisma db push
npx prisma generate

# Run both Next.js app AND WebSocket server (recommended for development)
npm run dev:all

# Or run them separately in different terminals:
# Terminal 1 - Next.js app:
npm run dev

# Terminal 2 - WebSocket server:
npm run ws

#Signup

<img width="955" height="446" alt="signup" src="https://github.com/user-attachments/assets/4d18d70e-6902-41a1-a61b-c64a939dc809" />

#login

<img width="744" height="445" alt="login" src="https://github.com/user-attachments/assets/30b0c849-2922-4c43-9fed-1b7e40f1cd0b" />

#chat 

<img width="960" height="445" alt="chat page" src="https://github.com/user-attachments/assets/eebff53a-718d-496f-aeb3-d4911033c831" />

#single user chat

<img width="960" height="500" alt="message" src="https://github.com/user-attachments/assets/3f477b58-7bec-4afb-a07d-11d57315c1c3" />

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
