#Same node version as in package.json
FROM node:20.3

#Create app folder 
WORKDIR /usr/src/app

#Copy package.json to app folder
COPY package.json ./

#Install dependencies
RUN npm install

#Copy all other files
COPY . .

#Expose port 3021
EXPOSE 3021

#Run app
CMD ["node","app.js"]