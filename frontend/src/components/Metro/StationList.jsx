import React, { useState, useEffect } from 'react';
import axios from 'axios';
import fareStationsData from '../../data/fareStations.json';
import styled from 'styled-components';

const StationContainer = styled.div`
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
`;

const StationGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
`;

const StationCard = styled.div`
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
    
    h4 {
        color: #0066b3;
        margin-bottom: 0.5rem;
    }
    
    p {
        font-size: 0.9rem;
        color: #666;
    }
`;

const LoadingMessage = styled.div`
    text-align: center;
    padding: 2rem;
    color: #666;
`;

function StationList() {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const response = await axios.get('/api/metro/stations');
                setStations(response.data || []);
                setError(null);
            } catch (err) {
                console.error('Error fetching stations:', err);
                setError('Unable to load stations');
                // Fallback to local static stations
                setStations(fareStationsData || []);
            } finally {
                setLoading(false);
            }
        };

        fetchStations();
    }, []);

    if (loading) {
        return <LoadingMessage>Loading stations...</LoadingMessage>;
    }

    return (
        <StationContainer>
            <h2>KMRL Stations</h2>
            {error && <p style={{ color: '#dc3545' }}>{error}</p>}
            <StationGrid>
                {stations.map(station => (
                    <StationCard key={station.id || station._id}>
                        <h4>{station.name}</h4>
                        <p>Code: {station.code}</p>
                        {station.facilities && <p>Facilities: {station.facilities}</p>}
                    </StationCard>
                ))}
            </StationGrid>
            {stations.length === 0 && !error && (
                <LoadingMessage>No stations available</LoadingMessage>
            )}
        </StationContainer>
    );
}

export default StationList;
