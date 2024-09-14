# Specifying the base image for subsequent instructions.
FROM node:20.9.0-alpine3.18 as builder

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Installing the dependencies using yarn.
RUN yarn install

# Copying the rest of the application code to the working directory
COPY . .

# Building the application.
RUN yarn build

# The Docker container will listen on port 5555.
EXPOSE 5555

# Specifying the command to run when the Docker container is started.
CMD ["node", ".output/server/index.mjs"]