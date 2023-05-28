# Use the Node.js image as the base image
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application files to the container
COPY . .

ENV PORT=3000

# Optional: If your bot uses environment variables, uncomment the following line and specify the required variables
# ENV BOT_TOKEN=your_bot_token

# Expose the port on which your bot will run (if necessary)
EXPOSE $PORT

# Run the command to start the bot
CMD [ "npm", "start" ]
