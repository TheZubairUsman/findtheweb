# FindTheWeb Backend

Backend API for the FindTheWeb platform, built with Node.js, Express, and PostgreSQL.

## 🚀 Features

- 🔐 Authentication & Authorization (JWT)
- 👥 User Management
- 📧 Email Verification
- 🔄 Password Reset
- 🔒 Two-Factor Authentication (2FA)
- 📝 Business Listings Management
- ⭐ Ratings & Reviews
- 📊 Analytics
- 📄 File Uploads (AWS S3)
- 📈 API Documentation (Swagger/OpenAPI)
- 🛡️ Security Best Practices
- 📊 Request Validation
- 📝 Logging

## 🛠️ Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT, Passport.js
- **Email**: Nodemailer with Handlebars templates
- **File Storage**: AWS S3
- **Payments**: Stripe
- **Logging**: Winston
- **Validation**: Joi, express-validator
- **Testing**: Jest, Supertest
- **Linting**: ESLint, Prettier

## 📦 Prerequisites

- Node.js 16+
- PostgreSQL 12+
- npm or yarn
- AWS S3 Bucket (for file uploads)
- SMTP Server (or Ethereal for development)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/findtheweb-backend.git
   cd findtheweb-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   - Create a new PostgreSQL database
   - Update the database credentials in `.env`

5. **Run migrations**
   ```bash
   npm run migrate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 🛠️ Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot-reload
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Lint code
- `npm run format` - Format code
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed the database with test data

### Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/           # Database models
├── routes/           # API routes
├── services/         # Business logic
├── utils/            # Utility functions
├── validators/       # Request validators
└── index.js          # Application entry point
```

## 🌐 API Documentation

API documentation is available at `/api-docs` when running in development mode.

## 🔒 Environment Variables

See [.env.example](.env.example) for all available environment variables.

## 🚀 Deployment

### Production Deployment

1. Set up a production database
2. Update environment variables in `.env`
3. Install production dependencies:
   ```bash
   npm install --production
   ```
4. Build the application:
   ```bash
   npm run build
   ```
5. Start the production server:
   ```bash
   npm start
   ```

### PM2 (Recommended for Production)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/index.js --name "findtheweb-api"

# Save process list for auto-restart
pm2 save
pm2 startup

# View logs
pm2 logs findtheweb-api
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/)
- [Sequelize](https://sequelize.org/)
- [Passport.js](http://www.passportjs.org/)
- [Winston](https://github.com/winstonjs/winston)
- And all other amazing open-source projects used in this project.
