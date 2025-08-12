# Component Data Alignment Analysis - Schema Compliant

## Overview
This document analyzes the alignment between the newly created dashboard components and the data wiring specifications, **strictly following the schema defined in expectedFields-mockup.sql**.

## Schema Analysis - Available Fields Only

### **Clients Table Schema:**
```sql
CREATE TABLE public.Clients (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  Domain text NOT NULL UNIQUE,
  Company Name text NOT NULL,
  Primary Email text,
  Primary Number text,
  Contact Title text,
  Industry text,
  Services text,
  Onboarding Date date DEFAULT now(),
  instantly_api text,
  bison_api text,
  instantly_api_v2 text
);
```

### **Leads Table Schema:**
```sql
CREATE TABLE public.Leads (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  Email text NOT NULL UNIQUE,
  First Name text,
  Last Name text,
  internal_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  lead_mx_provider text,
  client_id bigint,
  campaign_id bigint,
  // ... other fields
);
```

### **Campaigns Table Schema:**
```sql
CREATE TABLE public.Campaigns (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  campaign_id text NOT NULL UNIQUE,
  campaign_name text NOT NULL,
  platform text NOT NULL,
  client_id bigint NOT NULL,
  sent integer,
  contacted integer,
  opens integer,
  replies integer,
  bounced integer,
  interested integer,
  status text,
  client_name text
);
```

### **Inboxes Table Schema:**
```sql
CREATE TABLE public.inboxes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  domain_id uuid DEFAULT gen_random_uuid(),
  email text UNIQUE,
  daily_send_limit text,
  send_count text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);
```

## ❌ **FIELDS TO REMOVE FROM COMPONENTS**

### **1. Executive Overview Page - Remove Non-Schema Fields:**

#### **Current (INCORRECT) Fields:**
```typescript
// ❌ REMOVE: These fields don't exist in schema
interface ClientData {
  name: string;           // ❌ Should be "Company Name"
  positiveReplies: number; // ❌ Not in Clients table
  replyRateChange: number; // ❌ Not in Clients table
  platform: 'Instantly' | 'Bison' | 'Mixed'; // ❌ Not in Clients table
  status: 'active' | 'paused' | 'warning';   // ❌ Not in Clients table
}
```

#### **Correct Schema-Based Fields:**
```typescript
// ✅ CORRECT: Only use schema fields
interface ClientData {
  id: bigint;
  Domain: string;
  Company_Name: string;
  Primary_Email: string;
  Primary_Number: string;
  Contact_Title: string;
  Industry: string;
  Services: string;
  Onboarding_Date: date;
  instantly_api: string;
  bison_api: string;
  instantly_api_v2: string;
}
```

### **2. Client Detail Page - Remove Non-Schema Fields:**

#### **Current (INCORRECT) Fields:**
```typescript
// ❌ REMOVE: These fields don't exist in schema
interface ClientData {
  name: string;           // ❌ Should be "Company Name"
  onboardDate: string;    // ❌ Should be "Onboarding Date"
  platforms: string[];    // ❌ Not in Clients table
  status: 'active' | 'paused' | 'warning'; // ❌ Not in Clients table
}

interface CampaignData {
  platform: 'Instantly' | 'Bison' | 'Missive'; // ❌ Should come from Campaigns.platform
  uniqueLeads: number;    // ❌ Should be calculated from Leads table
  sendToPositiveRatio: number; // ❌ Not in schema
  lastSendDate: string;   // ❌ Not in schema
  sparklineData: number[]; // ❌ Not in schema
}
```

#### **Correct Schema-Based Fields:**
```typescript
// ✅ CORRECT: Only use schema fields
interface ClientData {
  id: bigint;
  Domain: string;
  Company_Name: string;
  Primary_Email: string;
  Primary_Number: string;
  Contact_Title: string;
  Industry: string;
  Services: string;
  Onboarding_Date: date;
  instantly_api: string;
  bison_api: string;
  instantly_api_v2: string;
}

interface CampaignData {
  id: bigint;
  campaign_id: string;
  campaign_name: string;
  platform: string;
  client_id: bigint;
  sent: integer;
  contacted: integer;
  opens: integer;
  replies: integer;
  bounced: integer;
  interested: integer;
  status: string;
  client_name: string;
}
```

### **3. Campaign Detail Page - Remove Non-Schema Fields:**

#### **Current (INCORRECT) Fields:**
```typescript
// ❌ REMOVE: These fields don't exist in schema
interface CampaignMetadata {
  workspace: string;      // ❌ Not in Campaigns table
  owner: string;          // ❌ Not in Campaigns table
  createdDate: string;    // ❌ Not in Campaigns table
  lastModified: string;   // ❌ Not in Campaigns table
  totalSteps: number;     // ❌ Not in Campaigns table
  activeSteps: number;    // ❌ Not in Campaigns table
}
```

#### **Correct Schema-Based Fields:**
```typescript
// ✅ CORRECT: Only use schema fields
interface CampaignMetadata {
  id: bigint;
  campaign_id: string;
  campaign_name: string;
  platform: string;
  client_id: bigint;
  sent: integer;
  contacted: integer;
  opens: integer;
  replies: integer;
  bounced: integer;
  interested: integer;
  status: string;
  client_name: string;
}
```

### **4. Inbox Health Page - Remove Non-Schema Fields:**

#### **Current (INCORRECT) Fields:**
```typescript
// ❌ REMOVE: These fields don't exist in schema
interface InboxData {
  dailySendLimit: number; // ❌ Should be "daily_send_limit" (text)
  todaySendCount: number; // ❌ Should be "send_count" (text)
  usagePercentage: number; // ❌ Not in schema - calculated field
  lastSentAt: string;     // ❌ Not in schema
  status: 'active' | 'warmup' | 'paused' | 'blocked'; // ❌ Not in schema
  sendingErrors: number;  // ❌ Not in schema
  errorRate: number;      // ❌ Not in schema
}
```

#### **Correct Schema-Based Fields:**
```typescript
// ✅ CORRECT: Only use schema fields
interface InboxData {
  id: uuid;
  domain_id: uuid;
  email: string;
  daily_send_limit: string; // Note: text type in schema
  send_count: string;       // Note: text type in schema
  created_at: timestamp;
  updated_at: timestamp;
}
```

### **5. Deliverability Investigation Page - Remove Non-Schema Fields:**

#### **Current (INCORRECT) Fields:**
```typescript
// ❌ REMOVE: These fields don't exist in schema
interface BounceExample {
  email: string;           // ❌ Should come from Leads.Email
  domain: string;          // ❌ Should be extracted from Leads.Email
  provider: string;        // ❌ Should be Leads.lead_mx_provider
  reason: string;          // ❌ Not in schema
  bounceType: 'hard' | 'soft'; // ❌ Not in schema
  timestamp: string;       // ❌ Not in schema
  campaign: string;        // ❌ Should come from Campaigns.campaign_name
}
```

#### **Correct Schema-Based Fields:**
```typescript
// ✅ CORRECT: Only use schema fields
interface BounceExample {
  // From Leads table
  id: bigint;
  Email: string;
  lead_mx_provider: string;
  client_id: bigint;
  campaign_id: bigint;
  
  // From send tables (bison_sends, instantly_sends, missive_sends)
  raw_message_id: string;
  
  // From Campaigns table
  campaign_name: string;
}
```

## 🔧 **REQUIRED COMPONENT UPDATES**

### **1. Update Executive Overview Component:**
```typescript
// Remove non-schema fields and use only schema fields
interface ClientData {
  id: bigint;
  Domain: string;
  Company_Name: string;
  Primary_Email: string;
  // ... only schema fields
}
```

### **2. Update Client Detail Component:**
```typescript
// Remove calculated fields and use only schema fields
interface ClientData {
  id: bigint;
  Domain: string;
  Company_Name: string;
  Onboarding_Date: date;
  // ... only schema fields
}
```

### **3. Update Campaign Detail Component:**
```typescript
// Remove non-schema fields and use only schema fields
interface CampaignMetadata {
  id: bigint;
  campaign_id: string;
  campaign_name: string;
  platform: string;
  // ... only schema fields
}
```

### **4. Update Inbox Health Component:**
```typescript
// Remove calculated fields and use only schema fields
interface InboxData {
  id: uuid;
  domain_id: uuid;
  email: string;
  daily_send_limit: string; // Note: text type
  send_count: string;       // Note: text type
  // ... only schema fields
}
```

### **5. Update Deliverability Investigation Component:**
```typescript
// Remove non-schema fields and use only schema fields
interface BounceExample {
  // Only use fields that exist in schema
  Email: string;           // From Leads.Email
  lead_mx_provider: string; // From Leads.lead_mx_provider
  raw_message_id: string;   // From send tables
  // ... only schema fields
}
```

## 📊 **SCHEMA-COMPLIANT DATA MAPPING**

### **Executive Overview - Schema Fields Only:**
```typescript
// KPI calculations using only schema fields
const kpiData = {
  replyRate: (totalReplies / totalSends) * 100,
  // totalReplies: sum of bison_replies + instantly_replies + missive_replies
  // totalSends: sum of bison_sends + instantly_sends + missive_sends
  
  uniqueLeads: Leads.count(distinct by internal_id),
  
  // All other metrics calculated from schema fields only
}
```

### **Client Detail - Schema Fields Only:**
```typescript
// Client data using only schema fields
const clientData = {
  id: Clients.id,
  Domain: Clients.Domain,
  Company_Name: Clients.Company_Name,
  Onboarding_Date: Clients.Onboarding_Date,
  // ... only schema fields
}

// Campaign data using only schema fields
const campaignData = {
  id: Campaigns.id,
  campaign_name: Campaigns.campaign_name,
  platform: Campaigns.platform,
  sent: Campaigns.sent,
  replies: Campaigns.replies,
  // ... only schema fields
}
```

### **Campaign Detail - Schema Fields Only:**
```typescript
// Campaign metadata using only schema fields
const campaignMetadata = {
  id: Campaigns.id,
  campaign_id: Campaigns.campaign_id,
  campaign_name: Campaigns.campaign_name,
  platform: Campaigns.platform,
  client_id: Campaigns.client_id,
  // ... only schema fields
}
```

### **Inbox Health - Schema Fields Only:**
```typescript
// Inbox data using only schema fields
const inboxData = {
  id: inboxes.id,
  domain_id: inboxes.domain_id,
  email: inboxes.email,
  daily_send_limit: inboxes.daily_send_limit, // text type
  send_count: inboxes.send_count,             // text type
  // ... only schema fields
}
```

## 🎯 **CONCLUSION**

The components need to be updated to **strictly follow the schema** and remove any fields that don't exist in the `expectedFields-mockup.sql` schema. This includes:

1. **Remove calculated fields** that aren't in the schema
2. **Use exact field names** from the schema (e.g., `Company_Name` not `name`)
3. **Use correct data types** from the schema (e.g., `text` for `daily_send_limit`)
4. **Remove status fields** that don't exist in the schema
5. **Remove platform fields** that should come from related tables

The components should only use fields that are explicitly defined in the database schema to ensure data consistency and avoid runtime errors.
