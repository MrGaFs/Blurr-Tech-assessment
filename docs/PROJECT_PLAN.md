# Blurr HR Portal - Project Plan

## 1. Project Overview
The Blurr HR Portal is a comprehensive employee and project management system built with Next.js, featuring employee management, salary calculations, and project tracking capabilities.

## 2. Technical Architecture

### 2.1 Frontend Architecture
- **Framework**: Next.js 15.3.2 with App Router
- **UI Components**: 
  - shadcn/ui for base components
  - Tailwind CSS for styling
  - Radix UI for accessible primitives
- **State Management**: React Server Components + Server Actions
- **Form Handling**: react-hook-form with zod validation

### 2.2 Database Schema
```prisma
// Existing Models
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  password      String?
  image         String?
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// New Models to Add
model Employee {
  id            String    @id @default(cuid())
  employeeId    String    @unique
  name          String
  joiningDate   DateTime
  basicSalary   Float
  tasks         Task[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Project {
  id           String    @id @default(cuid())
  name         String
  description  String?
  tasks        Task[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  priority    Priority
  status      TaskStatus
  assignedTo  Employee? @relation(fields: [employeeId], references: [id])
  employeeId  String?
  project     Project   @relation(fields: [projectId], references: [id])
  projectId   String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model SalaryRecord {
  id          String    @id @default(cuid())
  employee    Employee  @relation(fields: [employeeId], references: [id])
  employeeId  String
  month       DateTime
  basicSalary Float
  bonus       Float     @default(0)
  deduction   Float     @default(0)
  totalAmount Float
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
}
```

## 3. Implementation Plan

### Phase 1: Employee Management
1. Create employee CRUD operations
2. Implement employee list view with search and filters
3. Build employee detail view
4. Create salary management system
   - Monthly salary calculation
   - Bonus and deduction management
   - Salary history view
5. Implement SalaryTable component
   - Month-based filtering interface
   - Employee salary data display
   - Interactive bonus and deduction adjustments
   - Real-time calculation of final payable amounts
   - Bulk salary record generation

### Phase 2: Project Management
1. Project CRUD operations
2. Task management system
   - Task creation and assignment
   - Priority and status management
3. Kanban board implementation
4. Backlog view with filtering and sorting

### Phase 3: AI Chatbot Integration
1. Set up AI chat interface
2. Implement context-aware responses
3. Add task and project querying capabilities

## 4. Directory Structure
```
src/
├── app/
│   ├── dashboard/
│   │   ├── employees/
│   │   ├── projects/
│   │   └── salary/
│   └── api/
├── components/
│   ├── ui/
│   ├── employees/
│   ├── projects/
│   └── salary/
├── lib/
│   ├── actions/
│   ├── utils/
│   └── validations/
└── types/
```

## 5. Key Features Implementation Details

### 5.1 Employee Management
- Employee form with validation
- Salary calculation system
- Employee search and filtering
- Salary history tracking
- Comprehensive salary table with month-based filtering
- Interactive salary management interface with real-time bonus/deduction adjustments
- Automatic calculation of final payable amount based on basic salary, bonuses, and deductions
- Bulk salary processing capabilities

### 5.2 Project Management
- Project creation and management
- Task assignment system
- Kanban board with drag-and-drop
- Task filtering and sorting

### 5.3 AI Chatbot
- Context-aware responses
- Task and project information retrieval
- Natural language processing for queries

## 6. Testing Strategy
- Unit tests for utility functions
- Integration tests for API routes
- E2E tests for critical user flows
- Component testing with React Testing Library

## 7. Performance Considerations
- Server-side rendering for critical pages
- Client-side caching for frequently accessed data
- Optimistic updates for better UX
- Image optimization and lazy loading

## 8. Security Measures
- Input validation and sanitization
- CSRF protection
- Rate limiting
- Role-based access control

## 9. Deployment Strategy
- Vercel deployment
- Environment variable management
- Database migration strategy
- Monitoring and logging setup 