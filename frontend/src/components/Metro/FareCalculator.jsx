import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const FareContainer = styled.div`
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
`;

const FareForm = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
    label {
        font-weight: 500;
        color: #333;
    }
    
    select, input {
        padding: 0.8rem;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1rem;
        background: white;
        
        &:focus {
            outline: none;
            border-color: #0066b3;
            box-shadow: 0 0 0 2px rgba(0,102,179,0.2);
        }
    }
`;

const Button = styled.button`
    padding: 0.8rem 1.5rem;
    background: linear-gradient(135deg, #0066b3 0%, #003f7f 100%);
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,102,179,0.3);
    }
`;

const ResultContainer = styled.div`
    background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
    padding: 1.5rem;
    border-radius: 5px;
    margin-top: 1.5rem;
    border-left: 4px solid #0066b3;
    
    h3 {
        color: #0066b3;
        margin-bottom: 1rem;
    }
    
    .fare-result {
        font-size: 1.8rem;
        font-weight: bold;
        color: #003f7f;
    }
    
    p {
        margin: 0.5rem 0;
        color: #666;
    }
`;

function FareCalculator() {
    const [fromStation, setFromStation] = useState('');
    const [toStation, setToStation] = useState('');
    const [stations, setStations] = useState([]);
    const [fare, setFare] = useState(null);
    const [distance, setDistance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const response = await axios.get('/api/metro/stations');
                setStations(response.data || []);
            } catch (err) {
                console.error('Error fetching stations:', err);
                // Mock stations for demo
                setStations([
                    { id: 1, name: 'Aluva', code: 'ALV' },
                    { id: 2, name: 'Ernakulathappan', code: 'ERT' },
                    { id: 3, name: 'Kadavanthra', code: 'KDV' },
                    { id: 4, name: 'MG Road', code: 'MGR' }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchStations();
    }, []);

    const calculateFare = async (e) => {
        e.preventDefault();
        if (!fromStation || !toStation) {
            alert('Please select both stations');
            return;
        }

        try {
            // Local fare calculation based on station indices
            const fromIdx = stations.findIndex(s => s.code === fromStation);
            const toIdx = stations.findIndex(s => s.code === toStation);
            if (fromIdx === -1 || toIdx === -1) {
                throw new Error('Stations not found');
            }
            const dist = Math.abs(toIdx - fromIdx);
            const basefare = Math.max(20, dist * 5);
            setFare(basefare);
            setDistance(dist);
        } catch (err) {
            console.error('Error calculating fare:', err);
            setFare(20);
            setDistance(0);
        }
    };

    if (loading) {
        return <FareContainer>Loading...</FareContainer>;
    }

    return (
        <FareContainer>
            <h2>Calculate Fare</h2>
            <FareForm onSubmit={calculateFare}>
                <InputGroup>
                    <label htmlFor="from">From Station</label>
                    <select 
                        id="from"
                        value={fromStation} 
                        onChange={(e) => setFromStation(e.target.value)}
                    >
                        <option value="">Select a station</option>
                        {stations.map(station => (
                            <option key={station.id || station._id} value={station.code}>
                                {station.name}
                            </option>
                        ))}
                    </select>
                </InputGroup>

                <InputGroup>
                    <label htmlFor="to">To Station</label>
                    <select 
                        id="to"
                        value={toStation} 
                        onChange={(e) => setToStation(e.target.value)}
                    >
                        <option value="">Select a station</option>
                        {stations.map(station => (
                            <option key={station.id || station._id} value={station.code}>
                                {station.name}
                            </option>
                        ))}
                    </select>
                </InputGroup>

                <Button type="submit">Calculate Fare</Button>
            </FareForm>

            {fare !== null && (
                <ResultContainer>
                    <h3>Fare Calculation Result</h3>
                    <p>Distance: {distance} km</p>
                    <div className="fare-result">₹ {fare}</div>
                    <p>Tax and other charges may apply</p>
                </ResultContainer>
            )}
        </FareContainer>
    );
}

export default FareCalculator;
