flowchart TD
    A[Start] --> B[Login / Sign Up]
    B --> C[Enter Credentials]
    C --> D{Valid Login?}
    D -->|Yes| E[Determine User Role]
    D -->|No| F[Display Error\nRetry Login]
    
    E --> G[Admin]
    E --> H[Manager]
    E --> I[Driver]
    E --> J[Warehouse]
    
    %% Admin Flow
    G --> K[Admin Dashboard\nAnalytics & Reports]
    K --> L[Account Management]
    
    %% Manager (Dispatcher) Flow
    H --> M[Manager Dashboard]
    M --> N[Select Next Delivery Day]
    N --> O[Load Previous Schedule]
    O --> P[Edit & Adjust Orders\nImport / Manual Entry]
    P --> Q[Assign Drivers\nOptimize Routes]
    Q --> R[Coordinate with Warehouse]
    R --> S[Bulk Status Updates]
    S --> T[Review & Approve Schedule]
    T --> U[Finalize & Distribute Schedule]
    U --> L
    
    %% Driver Flow
    I --> V[Driver Mobile Interface]
    V --> W[View Assigned Schedule]
    W --> X[Update Delivery Status\nAdd Notes / Photos]
    X --> Y[Tap-to-Call & Map Navigation]
    Y --> L
    
    %% Warehouse Flow
    J --> Z[Warehouse Dashboard]
    Z --> AA[View Item Summary]
    AA --> AB[Log Production Data\nUpdate Inventory]
    AB --> L
    
    %% Supplier Orders Module (accessed from Manager)
    P --> AC[Manage Supplier Orders]
    AC --> AD[Review & Create Supplier Order]
    AD --> AE[Generate PDF / Shareable Link]
    AE --> AB
    
    %% Reporting and Analytics (accessible from Admin and Manager)
    K --> AF[Generate Financial Reports]
    AF --> AG[Export to CSV / PDF]
    AG --> L
    
    %% Settings
    L --> AH[Update Profile & Preferences]