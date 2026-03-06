cd backend && npx nodemon index.js > ../server_output.log 2>&1 &
cd frontend && npx expo start --web > ../npm_output.log 2>&1 &
