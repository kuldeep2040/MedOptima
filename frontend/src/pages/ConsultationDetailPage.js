import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useFetchUser from '../utils/useFetchUser';
import { BASE_URL } from '../config';

const ConsultationDetailPage = (props) => {
  const { sessionId } = useParams();
  const [sessionDetails, setSessionDetails] = useState({});
  const { userDetails, fetchUser, authToken } = useFetchUser();
  const navigate = useNavigate(); // Use useNavigate for navigation
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchUser(); // Wait for fetchUser to complete
        const response = await fetch(`${BASE_URL}/api/sessions/${sessionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': authToken,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch session details');
        }

        const data = await response.json();
        setSessionDetails(data);
      } catch (error) {
        console.error('Error fetching session details:', error);
        setError('Failed to fetch session details');
      } finally {
        setLoading(false); // Set loading to false regardless of success or failure
      }
    };

    if (sessionId) {
      fetchData();
    }
  }, [authToken, fetchUser, sessionId]);

  const handleEndSession = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/sessions/${sessionId}/end`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': authToken,
        },
      });

      if (response.ok) {
        props.showAlert("Successfully ended the session", 'success');
        navigate(-1); // Go back one step in the history
      } else {
        props.showAlert("Failed to end the session", 'danger');
      }
    } catch (error) {
      console.error('Error ending session:', error);
      props.showAlert("Failed to end the session", 'danger');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-10 offset-md-1">
          {sessionDetails && (
            <div className="card">
              <div className="card-body">
                <h4 className="card-title text-center mb-4">Session Information</h4>
                <div>
                  {userDetails.userType === 'patient' ? (
                    <p><span className='text-muted'>Doctor: </span>{sessionDetails.doctorName}</p>
                  ) : (
                    <p><strong>Patient: </strong>{sessionDetails.patientName}</p>
                  )}
                  <p><span className='text-muted'>Problem: </span>{sessionDetails.problem}</p>
                  <p><span className='text-muted'>Symptoms: </span>{sessionDetails.symptoms}</p>
                  <p><span className='text-muted'>Date: </span>{new Date(sessionDetails.startTime).toDateString()}</p>
                  <p><span className='text-muted'>Time: </span>{new Date(sessionDetails.startTime).toTimeString().split(" ")[0]}</p>
                  <p><span className='text-muted'>Status: </span>{sessionDetails.status}</p>
                </div>
              </div>
            </div>
          )}
          {sessionDetails && sessionDetails.status === "Active" && (
            <button className="btn btn-secondary mt-3" onClick={handleEndSession}>End Session</button>
          )}
         
            <div className="mt-4">
              <ul className="nav nav-pills justify-content-center">
                <li className="nav-item mx-3">
                  <Link to={`/prescription/${sessionId}/${sessionDetails.status}`} className={`nav-link btn btn-link`}>Prescription</Link>
                </li>
                <li className="nav-item mx-3">
                  <Link to={`/medicalRecord/${sessionId}/${sessionDetails.status}`} className={`nav-link btn btn-link `} >Medical Records</Link>
                </li>
                <li className="nav-item mx-3">
                  <Link to={`/chat/${sessionId}/${sessionDetails.status}`} className={`nav-link btn btn-link `} >Chat</Link>
                </li>
              </ul>
            </div>
    
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetailPage;
