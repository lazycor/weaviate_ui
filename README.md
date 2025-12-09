# Weaviate UI

A modern, user-friendly web interface for managing and exploring Weaviate vector databases. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

### 🔌 Connection Management
- Connect to remote Weaviate instances using URL and optional API key
- Secure credential handling
- Connection validation before access

### 📊 Data Exploration
- **Class/Index Browser**: View all classes/collections in your Weaviate database
- **Side Panel Navigation**: Easy selection and switching between classes
- **Table View**: Display all documents/chunks in a clean, organized table format
- **Document Details**: View complete document information in a dedicated modal

### 🔍 Search & Filter
- **Plain Text Search**: Search documents using natural language queries (powered by Weaviate's vector search)
- **Advanced Filtering**: Filter documents by property keys and values with multiple operators:
  - Equal
  - Not Equal
  - Greater Than / Less Than
  - Greater Than or Equal / Less Than or Equal
  - Like (contains)
- **Multiple Filters**: Combine multiple filters with AND logic
- **Real-time Results**: Instant search and filter results

### 🎨 User Interface
- Clean, modern design with Tailwind CSS
- Responsive layout
- Intuitive navigation
- Dark mode support (via Tailwind)

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn
- A running Weaviate instance

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd weaviate_ui
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Usage

### Connecting to Weaviate

1. Launch the application
2. Enter your Weaviate instance URL (e.g., `http://localhost:8080` or `https://your-cloud-instance.weaviate.network`)
3. (Optional) Enter your API key if authentication is required
4. Click "Connect"

### Browsing Classes

- After connecting, all classes will be listed in the left sidebar
- Click on any class name to view its documents

### Viewing Documents

- Documents are displayed in a table format
- Each row represents one document/chunk
- Click the "View" button to see complete document details including:
  - Full document ID
  - All properties with formatted values
  - Vector embeddings (if available)
  - Raw JSON representation

### Searching Documents

**Plain Text Search:**
1. Enter your search query in the search bar
2. Press Enter or click "Search"
3. Results are returned using Weaviate's vector similarity search

**Filtering Documents:**
1. Click "Show Filters" to open the filter panel
2. Add filters by specifying:
   - Property Key (e.g., "title", "content")
   - Operator (Equal, NotEqual, GreaterThan, etc.)
   - Value
3. Click the "+" button to add the filter
4. Click "Search" to apply filters
5. Use the "Clear" button to reset search and filters

### Combining Search and Filters

You can combine plain text search with filters for more precise results:
1. Enter a search query
2. Add one or more filters
3. Click "Search"

## Project Structure

```
weaviate_ui/
├── app/
│   ├── api/
│   │   └── weaviate/
│   │       ├── connect/     # Connection validation endpoint
│   │       ├── classes/     # Fetch all classes endpoint
│   │       ├── objects/     # Fetch objects from a class
│   │       └── search/      # Search and filter endpoint
│   ├── components/
│   │   ├── ConnectionForm.tsx    # Connection form component
│   │   ├── Sidebar.tsx          # Class list sidebar
│   │   ├── ObjectsTable.tsx     # Main table view
│   │   ├── DocumentModal.tsx    # Document detail modal
│   │   └── FilterPanel.tsx      # Advanced filter panel
│   ├── types.ts            # TypeScript type definitions
│   ├── page.tsx           # Main application page
│   └── layout.tsx         # Root layout
├── public/
├── package.json
└── README.md
```

## API Routes

### POST /api/weaviate/connect
Test connection to a Weaviate instance.

**Request Body:**
```json
{
  "url": "http://localhost:8080",
  "apiKey": "optional-api-key"
}
```

### POST /api/weaviate/classes
Get all classes/collections from the database.

**Request Body:**
```json
{
  "url": "http://localhost:8080",
  "apiKey": "optional-api-key"
}
```

### POST /api/weaviate/objects
Fetch objects from a specific class.

**Request Body:**
```json
{
  "url": "http://localhost:8080",
  "apiKey": "optional-api-key",
  "className": "Article",
  "limit": 100,
  "offset": 0
}
```

### POST /api/weaviate/search
Search and filter objects.

**Request Body:**
```json
{
  "url": "http://localhost:8080",
  "apiKey": "optional-api-key",
  "className": "Article",
  "searchText": "machine learning",
  "filters": [
    {
      "key": "category",
      "operator": "Equal",
      "value": "technology"
    }
  ],
  "limit": 100
}
```

## Technologies Used

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Weaviate Client** - Official Weaviate TypeScript/JavaScript client
- **React** - UI library

## Configuration

The application uses Next.js's built-in configuration. To customize:

- **Tailwind**: Edit `tailwind.config.ts`
- **TypeScript**: Edit `tsconfig.json`
- **Next.js**: Edit `next.config.ts`

## Environment Variables

No environment variables are required for basic functionality. All connection details are provided through the UI.

For advanced configuration, you can add:
- `NEXT_PUBLIC_DEFAULT_WEAVIATE_URL` - Default Weaviate URL to pre-fill

## Development

### Running Locally

```bash
npm run dev
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check Weaviate documentation: https://weaviate.io/developers/weaviate

## Roadmap

Future enhancements:
- [ ] Pagination for large datasets
- [ ] Export data to JSON/CSV
- [ ] Create/Update/Delete operations
- [ ] Schema visualization
- [ ] Query builder interface
- [ ] Batch operations
- [ ] GraphQL query support
- [ ] Multi-tenancy support
