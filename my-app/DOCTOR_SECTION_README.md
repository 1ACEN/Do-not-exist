# User Dashboard - Doctor Section

## Overview

The User Dashboard now includes a dedicated "Doctor" section in the sidebar that conditionally displays doctor information, prescriptions, and notes based on whether a doctor is assigned to the user.

## Navigation Updates

### User Navigation Bar
The navigation bar for users now shows only the essential links:
- **Dashboard** - Main user dashboard
- **Diagnosis** - Disease diagnosis page
- **Vitals** - Vitals tracking page

## Doctor Section Features

### 🔍 **Conditional Display**
- **Doctor Assigned**: Shows doctor info, prescriptions, and notes
- **No Doctor**: Shows "No doctor assigned" message with contact support option

### 👨‍⚕️ **Doctor Information**
When a doctor is assigned, displays:
- Doctor's name and specialization
- Contact information
- Assignment date
- Professional details

### 💊 **Prescriptions**
Shows current active prescriptions with:
- Medication name and dosage
- Frequency and duration
- Prescription date
- Additional notes from doctor

### 📝 **Doctor Notes**
Displays doctor's notes with:
- Note content and date
- Note type (general, follow-up, urgent)
- Color-coded by importance

## Data Structure

### DoctorInfo Type
```typescript
type DoctorInfo = {
  id: string;
  name: string;
  specialization: string;
  contact: string;
  assignedDate: string;
};
```

### Prescription Type
```typescript
type Prescription = {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedDate: string;
  notes?: string;
};
```

### DoctorNote Type
```typescript
type DoctorNote = {
  id: string;
  date: string;
  note: string;
  type: "general" | "follow-up" | "urgent";
};
```

## API Integration

### Doctor Info API (`/api/doctor-info`)
- **Method**: GET
- **Authentication**: Required (JWT token)
- **Access**: Only for users with `role: "client"`
- **Returns**: Doctor info, prescriptions, and notes

### Response Format
```json
{
  "doctorInfo": {
    "id": "doc1",
    "name": "Dr. Sarah Johnson",
    "specialization": "Cardiologist",
    "contact": "sarah.johnson@healthcare.com",
    "assignedDate": "2024-01-10"
  },
  "prescriptions": [
    {
      "id": "pres1",
      "medication": "Metformin",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "30 days",
      "prescribedDate": "2024-01-15",
      "notes": "Take with food to reduce stomach upset"
    }
  ],
  "doctorNotes": [
    {
      "id": "note1",
      "date": "2024-01-15",
      "note": "Patient shows improvement in blood pressure readings.",
      "type": "follow-up"
    }
  ]
}
```

## Visual Design

### Doctor Assigned State
- **Blue-themed** doctor information card
- **Green-themed** prescription cards
- **Purple-themed** doctor notes
- **Color-coded** note types (urgent=red, follow-up=blue, general=gray)

### No Doctor State
- **Gray-themed** empty state
- **UserX icon** to indicate no assignment
- **Clear messaging** about contacting support

## Implementation Details

### State Management
```typescript
const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(mockDoctorInfo);
const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions);
const [doctorNotes, setDoctorNotes] = useState<DoctorNote[]>(mockDoctorNotes);
```

### Conditional Rendering
```typescript
{doctorInfo ? (
  <div className="space-y-4">
    {/* Doctor info, prescriptions, notes */}
  </div>
) : (
  <div className="text-center py-4">
    <UserX className="h-8 w-8 mx-auto mb-2 text-slate-400" />
    <p className="text-slate-600 text-sm">No doctor assigned</p>
  </div>
)}
```

## Database Schema

### Users Collection
- `doctorId`: Reference to assigned doctor's user ID
- `doctorAssignedDate`: When doctor was assigned

### Prescriptions Collection
- `userId`: Reference to patient's user ID
- `medication`: Name of medication
- `dosage`: Dosage amount
- `frequency`: How often to take
- `duration`: How long to take
- `isActive`: Whether prescription is current

### DoctorNotes Collection
- `userId`: Reference to patient's user ID
- `note`: Note content
- `type`: Note type (general, follow-up, urgent)
- `date`: When note was created

## Future Enhancements

- **Real-time updates** when doctor adds new notes
- **Prescription reminders** and tracking
- **Direct messaging** with assigned doctor
- **Appointment scheduling** integration
- **Medication adherence** tracking
- **Doctor rating** and feedback system
