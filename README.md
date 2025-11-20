# Tech Sorting - File Search Application

A secure web application that allows users to search through specific folders for text and JSON files with powerful regex support and advanced filtering capabilities.

## Features

### Core Functionality
- **Folder Management**: Add and remove specific folders that are available for searching
- **Secure File Search**: Search through configured folders with built-in security measures
- **Regex Support**: Use regular expressions for advanced pattern matching
- **File Type Filtering**: Filter searches by file type (.txt and .json)
- **Case Sensitivity**: Toggle case-sensitive search option
- **Search Results**: View matched lines with line numbers and context

### Security Features
- **Path Validation**: All file paths are validated to prevent directory traversal attacks
- **File Type Restriction**: Only .txt and .json files are accessible through the search interface
- **Authentication**: All features require user authentication
- **Path Normalization**: Automatic path normalization prevents bypass attempts

## Prerequisites

Before setting up the application, ensure you have the following installed:

- **Node.js**: Version 22.13.0 or higher
- **pnpm**: Package manager (comes pre-installed with Node.js 22+)
- **Database**: MySQL or TiDB compatible database
- **Git**: For version control

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/h7ssain/tech-sorting.git
cd tech-sorting
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

The application uses environment variables for configuration. These are automatically managed by the Manus platform when deployed, but for local development, ensure you have a `.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL=mysql://user:password@localhost:3306/tech_sorting

# Authentication (provided by Manus platform)
JWT_SECRET=your-jwt-secret
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Application Configuration
VITE_APP_TITLE=Tech Sorting - File Search Application
VITE_APP_ID=your-app-id
```

### 4. Database Setup

Run the database migrations to create the required tables:

```bash
pnpm db:push
```

This command will:
- Generate migration files from the schema
- Apply migrations to your database
- Create the `users` and `searchFolders` tables

### 5. Start the Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Usage

### Initial Setup

After starting the application, you'll need to:

1. **Sign In**: Click the "Sign In" button and authenticate using Manus OAuth
2. **Configure Folders**: Navigate to "Manage Folders" to add searchable directories

### Adding Search Folders

To add a folder for searching:

1. Go to the **Manage Folders** page
2. Enter the full path to the folder (e.g., `C:\Users\YourName\Downloads`)
3. Optionally add a description (e.g., "Downloads folder")
4. Click **Add Folder**

**Important Notes:**
- Use absolute paths (full paths starting from the drive letter on Windows)
- The application will validate paths to ensure security
- You can add multiple folders for searching

### Searching Files

To search for files:

1. Navigate to the **Search** page
2. Enter your search query in the text field
3. Configure search options:
   - **Use Regular Expression**: Enable regex pattern matching
   - **Case Sensitive**: Make the search case-sensitive
   - **File Types**: Select which file types to search (.txt, .json, or both)
4. Click **Search Files**

### Search Examples

**Simple Text Search:**
```
Query: error
Options: Case Sensitive = OFF, Regex = OFF
Result: Finds all occurrences of "error" (case-insensitive)
```

**Regex Pattern Search:**
```
Query: \d{3}-\d{4}
Options: Regex = ON
Result: Finds phone numbers in format XXX-XXXX
```

**Case-Sensitive Search:**
```
Query: Error
Options: Case Sensitive = ON
Result: Finds only "Error" with capital E
```

**Complex Regex:**
```
Query: (error|warning|critical)
Options: Regex = ON
Result: Finds lines containing any of these words
```

## API Endpoints

The application uses tRPC for type-safe API communication. The main endpoints are:

### Folder Management

**List Folders**
```typescript
trpc.folders.list.useQuery()
// Returns: Array of configured search folders
```

**Add Folder**
```typescript
trpc.folders.add.useMutation({
  path: "C:\\Users\\Name\\Documents",
  description: "My documents"
})
```

**Delete Folder**
```typescript
trpc.folders.delete.useMutation({ id: 1 })
```

### Search

**Execute Search**
```typescript
trpc.search.execute.useMutation({
  query: "search term",
  useRegex: false,
  caseSensitive: false,
  fileTypes: [".txt", ".json"]
})
```

## Project Structure

```
tech-sorting/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   │   ├── Home.tsx           # Landing page
│   │   │   ├── FolderManagement.tsx  # Folder management UI
│   │   │   └── FileSearch.tsx     # Search interface
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Client libraries
│   │   └── App.tsx        # Main app component
├── server/                # Backend Node.js application
│   ├── routers.ts         # tRPC API routes
│   ├── db.ts              # Database queries
│   ├── fileSearch.ts      # File search logic
│   ├── fileSearch.test.ts # Security tests
│   └── folders.test.ts    # API tests
├── drizzle/               # Database schema and migrations
│   └── schema.ts          # Database table definitions
└── shared/                # Shared types and constants
```

## Security Considerations

### Path Traversal Prevention

The application implements multiple layers of security to prevent path traversal attacks:

1. **Path Normalization**: All paths are normalized using Node.js `path.normalize()`
2. **Whitelist Validation**: Only paths within configured folders are accessible
3. **Relative Path Detection**: Paths containing `..` after normalization are rejected
4. **Case-Insensitive Comparison**: Prevents case-based bypass attempts

### File Type Restrictions

Only `.txt` and `.json` files can be searched. This prevents:
- Execution of binary files
- Access to system configuration files
- Reading of sensitive file types

### Authentication

All API endpoints require authentication. Unauthenticated users cannot:
- Add or remove folders
- Perform searches
- View configured folders

## Testing

The application includes comprehensive unit tests covering security and functionality.

### Run All Tests

```bash
pnpm test
```

### Test Coverage

- **Path Validation Tests**: 9 tests covering various path traversal scenarios
- **File Type Tests**: 8 tests ensuring only allowed file types are accessible
- **API Tests**: 7 tests validating authentication and folder management
- **Auth Tests**: 1 test for logout functionality

**Total: 25 tests, all passing**

## Troubleshooting

### Issue: "No folders configured yet"

**Solution**: You need to add at least one folder before searching. Go to "Manage Folders" and add a folder path.

### Issue: "Cannot add folder: database not available"

**Solution**: Ensure your database is running and the `DATABASE_URL` environment variable is correctly configured. Run `pnpm db:push` to initialize the database.

### Issue: Search returns no results

**Possible causes:**
1. The folder paths don't exist on the server
2. No files match your search criteria
3. File permissions prevent reading

**Solution**: Verify that:
- The folder paths exist and are accessible
- The server has read permissions for the folders
- Your search query matches content in the files

### Issue: "Path validation failed"

**Solution**: This is a security feature. Ensure:
- You're using absolute paths (e.g., `C:\Users\Name\Folder`)
- The path doesn't contain `..` or other traversal attempts
- The path is within a configured search folder

### Issue: TypeScript errors during development

**Solution**: 
```bash
# Restart the development server
pnpm dev
```

## Deployment

### Using Manus Platform

The application is designed to be deployed on the Manus platform:

1. Ensure all changes are committed to git
2. Create a checkpoint using the Manus dashboard
3. Click the "Publish" button in the management UI
4. Your application will be deployed with a public URL

### Manual Deployment

For manual deployment to other platforms:

1. Build the application:
```bash
pnpm build
```

2. Set up environment variables on your hosting platform
3. Ensure your database is accessible from the deployment environment
4. Run database migrations:
```bash
pnpm db:push
```

5. Start the production server:
```bash
pnpm start
```

## Network Access

The application is designed to be accessible from any IP address in your private network. To make it accessible:

1. **Development**: The dev server binds to `localhost:3000` by default
2. **Production**: Deploy using the Manus platform or configure your server to bind to `0.0.0.0`
3. **Firewall**: Ensure port 3000 (or your configured port) is open in your firewall

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Ensure all tests pass: `pnpm test`
5. Commit your changes: `git commit -m "Add feature"`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or feature requests, please:
- Open an issue on GitHub: https://github.com/h7ssain/tech-sorting/issues
- Contact the maintainer

## Acknowledgments

Built with:
- React 19 - Frontend framework
- tRPC 11 - Type-safe API layer
- Express 4 - Backend server
- Drizzle ORM - Database toolkit
- Tailwind CSS 4 - Styling
- shadcn/ui - UI components
