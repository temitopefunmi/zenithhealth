import {
	People,
    Briefcase,
    Activity,
    Bullseye
} from 'react-bootstrap-icons';

export const NurseMetricsStats = [
    {
       id:1,
       title : "Assigned Patients",
       value : 18,
       icon: <People size={18}/>,
       statInfo: '<span className="text-dark me-2">5</span> Require Attention' 
    },
    {
        id:2,
        title : "Medication Tasks",
        value : 14,
        icon: <Briefcase size={18}/>,
        statInfo: '<span className="text-dark me-2">10</span> Completed' 
     },
     {
        id:3,
        title : "Vitals Monitored",
        value : 18,
        icon: <Activity size={18}/>,
        statInfo: '<span className="text-success me-2">All</span> Stable' 
     },
     {
        id:4,
        title : "Equipment Status",
        value : '9/9',
        icon: <Bullseye size={18}/>,
        statInfo: '<span className="text-success me-2">Ready</span>' 
     }
];
export default NurseMetricsStats;