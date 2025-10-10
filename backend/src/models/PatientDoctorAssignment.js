import mongoose from 'mongoose'

const { Schema, model, Types } = mongoose

const PatientDoctorAssignmentSchema = new Schema({
  user_id: { type: Types.ObjectId, ref: 'User', required: true },
  doctor_id: { type: Types.ObjectId, ref: 'Doctor', required: true },
  assignment_date: { type: Date, default: Date.now }
}, { collection: 'patient_doctor_assignments' })

export const PatientDoctorAssignment = model('PatientDoctorAssignment', PatientDoctorAssignmentSchema)
