# Assistly

## Getting Started

1. Clone this repository
2. Create a `.env` file based on `.env.example`
3. Set up a Firebase project and add your configuration
4. Install dependencies:

```bash
npm install
```

5. Run the development server:

```bash
npm start
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_GA_ID=
```

## Features

- User authentication with Firebase
- Create and manage help requests
- Volunteer for requests
- Real-time updates
- Material-UI components
- Responsive design
- Google Analytics integration
- Error handling and loading states
- Toast notifications

## Production Deployment

1. Update environment variables for production
2. Build the project:

```bash
npm run build
```

3. Deploy to Firebase:

```bash
firebase deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

This project is licensed under the MIT License.