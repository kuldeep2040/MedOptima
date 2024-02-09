import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import RatingStars from 'react-rating-stars-component';
import useFetchUser from '../utils/useFetchUser';
import { BASE_URL } from '../config';

const DoctorDetailsPage = (props) => {
  const { doctorId } = useParams();
  const [doctorData, setDoctorData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const { userDetails, useFetchUser, authToken } = useFetchUser();

  useEffect(() => {
    // Fetch the doctor's details and reviews when the component mounts
    const fetchData = async () => {
      try {
        if (!doctorId) {
          console.error('Invalid doctor ID');
          return;
        }

        // Fetch doctor details
        const doctorResponse = await fetch(`${BASE_URL}/api/doctors/${doctorId}`);
        if (doctorResponse.ok) {
          const doctorData = await doctorResponse.json();
          setDoctorData(doctorData);
        } else {
          console.error('Failed to fetch doctor data');
        }

        // Fetch doctor reviews
        const reviewsResponse = await fetch(`${BASE_URL}/api/doctors/${doctorId}/fetchreviews`);
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setReviews(reviewsData);
        } else {
          console.error('Failed to fetch doctor reviews');
        }
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchData(); // Call the fetchData function
  }, [doctorId]); // Re-run effect when doctorId changes

  const [reviewRating, setReviewRating] = useState(5);
  const [userReview, setUserReview] = useState({
    patientName: userDetails.name || '', // Set patientName to user's name
    rating: 5,
    reviewText: '',
  });

  const handleReviewChange = (e) => {
    setUserReview({
      ...userReview,
      [e.target.name]: e.target.value,
    });
  };

  const handleReviewSubmit = async () => {
    try {
      if (!authToken) {
        console.log('User not logged in');
        return;
      }

      const newReview = {
        patientName: userDetails.name,
        rating: userReview.rating,
        reviewText: userReview.reviewText,
      };

      // Post the new review
      const response = await fetch(`${BASE_URL}/api/doctors/${doctorId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': authToken,
        },
        body: JSON.stringify(newReview),
      });

      if (response.ok) {
        props.showAlert('Successfully added Review', 'success');
        setReviews([...reviews, newReview]);
      } else {
        props.showAlert('Failed to submit review', 'danger');
      }
    } catch (error) {
      props.showAlert('Failed to submit review', 'danger');
    }
  };

  return (
    <div className="container mt-4 mb-5">
      {doctorData ? (
        <div className="row doctorProfile bg-white py-4">
          {/* Doctor Profile Details */}
          <div className="col-md-4 d-flex justify-content-center align-items-center">
            <img src={doctorData.profileImage} alt={doctorData.name} className="img-fluid rounded-circle mb-4 mx-5" />
          </div>
          <div className="col-md-8 doctorProfileDesc px-5">
            <h2 style={{ color: '#35A29F' }}>{doctorData.name}</h2>
            <p className="text-muted mb-2">{doctorData.speciality}</p>
            <p className="mb-2" style={{ color: doctorData.isAvailable === 'Available' ? 'green' : doctorData.isAvailable === 'Not Available' ? 'red' : 'blue' }}>
              {doctorData.isAvailable}
            </p>
            <p className="mb-1">
              <strong>Experience:</strong> {doctorData.experience}
            </p>
            <p className="mb-1">
              <strong>Location:</strong> {doctorData.location}
            </p>
            <p className="mb-1">
              <strong>Contact:</strong> {doctorData.email}
            </p>
            <p className="mb-4">
              <strong>Phone:</strong> {doctorData.phone}
            </p>
            <div>
              <h5 className="text-secondary">Bio</h5>
              <p>{doctorData.bio}</p>
            </div>
            {userDetails.userType === 'patient' && (
              <Link to={`/StartConsultation`} className="btn text-white mt-3" style={{ backgroundColor: '#4A55A2' }}>
                Start Consultation
              </Link>
            )}
          </div>
        </div>
      ) : (
        <p>Loading doctor details...</p>
      )}

      {/* Display reviews */}
      <div className="row mt-4">
        <div className="col-md-12 mt-4">
          <h4 className="mb-3">Reviews</h4>
          {reviews.length === 0 ? (
            <p>No reviews available.</p>
          ) : (
            <div className="row">
              {reviews.map((review) => (
                <div key={review.id} className="col-md-12">
                  <div className="card mb-4">
                    <div className="card-body">
                      <h5 className="card-title">{review.patientName}</h5>
                      <p className="card-text">{review.reviewText}</p>
                    </div>
                    <div className="card-footer">
                      <small className="text-muted">Rating: {review.rating}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Review Section */}
      {authToken ? (
        <div className="row mt-4">
          <div className="col-md-12 mt-4">
            <h4 className="mb-3">Add Your Review</h4>
            <div className="mb-3">
              <label className="form-label">Rating</label>
              <RatingStars
                count={5}
                size={30}
                value={userReview.rating}
                activeColor="#ffd700"
                onChange={(newRating) => setUserReview({ ...userReview, rating: newRating })}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="reviewText" className="form-label">
                Write Your Review
              </label>
              <textarea
                className="form-control"
                id="reviewText"
                name="reviewText"
                rows="4"
                value={userReview.reviewText}
                onChange={handleReviewChange}
              ></textarea>
            </div>
            <button className="btn text-white" style={{ backgroundColor: '#4A55A2' }} onClick={handleReviewSubmit}>
              Submit Review
            </button>
          </div>
        </div>
      ) : (
        <p>Please Login to Add Review</p>
      )}
    </div>
  );
};

export default DoctorDetailsPage;
