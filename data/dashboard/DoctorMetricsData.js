import {
	People,
    Calendar,
    Bullseye,
    CheckCircle
} from 'react-bootstrap-icons';

export const DoctorMetricsStats = [
    {
       id:1,
       title : "My Patients",
       value : 24,
       icon: <People size={18}/>,
       statInfo: '<span className="text-dark me-2">18</span> Admitted' 
    },
    {
        id:2,
        title : "Consultations Today",
        value : 12,
        icon: <Calendar size={18}/>,
        statInfo: '<span className="text-dark me-2">8</span> Completed' 
     },
     {
        id:3,
        title : "Pending Diagnoses",
        value : 5,
        icon: <Bullseye size={18}/>,
        statInfo: '<span className="text-warning me-2">2</span> Critical' 
     },
     {
        id:4,
        title : "Critical Cases",
        value : 2,
        icon: <CheckCircle size={18}/>,
        statInfo: '<span className="text-danger me-2">ICU</span> cases' 
     }
];
export default DoctorMetricsStats;