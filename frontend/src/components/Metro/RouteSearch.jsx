import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import TrainList from './TrainList';

const SearchContainer = styled.div`
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
`;

const SearchForm = styled.div`
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
    align-items: end;
    margin-bottom: 2rem;
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
    label {
        font-weight: 500;
        color: #333;
    }
    
    select {
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

const SwitchButton = styled.button`
    background: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 0.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        background: #e9ecef;
    }
`;

const SearchButton = styled.button`
    grid-column: 1 / -1;
    background: linear-gradient(135deg, #0066b3 0%, #003f7f 100%);
    color: white;
    padding: 1rem;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,102,179,0.3);
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const ResultsContainer = styled.div`
    margin-top: 2rem;
    padding: 2rem;
    background: #f8f9fa;
    border-radius: 10px;
    
    .journey-path {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
        padding: 1rem;
        background: white;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .station {
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .station-name {
            font-weight: bold;
            color: #0066b3;
        }
        
        .station-code {
            font-size: 0.9rem;
            color: #666;
        }
    }
    
    .path-line {
        flex: 1;
        height: 3px;
        background: linear-gradient(90deg, #0066b3, #003f7f);
        margin: 0 1rem;
        position: relative;
        
        &:before {
            content: '➤';
            position: absolute;
            right: -10px;
            top: -8px;
            color: #0066b3;
        }
    }
    
    .fare-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 2rem;
        
        .fare-card {
            background: white;
            padding: 1rem;
            border-radius: 5px;
            text-align: center;
            
            h4 {
                color: #666;
                margin: 0 0 0.5rem 0;
                font-size: 0.9rem;
            }
            
            p {
                font-size: 1.5rem;
                font-weight: bold;
                color: #0066b3;
                margin: 0;
            }
        }
    }
`;

const RouteSearch = () => {
    const [stations, setStations] = useState([]);
    const [selectedFrom, setSelectedFrom] = useState('');
    const [selectedTo, setSelectedTo] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchStations();
    }, []);

    const fetchStations = async () => {
        try {
            const response = await axios.get('/api/metro/stations');
            setStations(response.data || []);
            if ((response.data || []).length > 0) {
                setSelectedFrom(response.data[0].code);
                setSelectedTo(response.data[response.data.length - 1].code);
            }
        } catch (error) {
            console.error('Error fetching stations:', error);
            // Fallback to bundled metroLines data when API is unavailable
            try {
                const ml = (await import('../data/metroLines')).default;
                const flat = ml.flatMap(l => l.stations || []).map((s, idx) => ({ name: s.name, code: (s.code || s.name).slice(0,3).toUpperCase(), order: idx+1 }));
                setStations(flat);
                if (flat.length > 0) {
                    setSelectedFrom(flat[0].code);
                    setSelectedTo(flat[flat.length-1].code);
                }
            } catch (e) {
                console.error('Fallback stations load failed', e);
            }
        }
    };

    const switchStations = () => {
        setSelectedFrom(selectedTo);
        setSelectedTo(selectedFrom);
    };

    const searchRoute = async () => {
        if (!selectedFrom || !selectedTo || selectedFrom === selectedTo) {
            alert('Please select different stations');
            return;
        }

        setIsLoading(true);
        try {
            // Local fare calculation using station positions
            const fromIdx = stations.findIndex(s => s.code === selectedFrom);
            const toIdx = stations.findIndex(s => s.code === selectedTo);
            if (fromIdx === -1 || toIdx === -1) throw new Error('Stations not found');
            const stationsTravelled = Math.abs(toIdx - fromIdx);
            const estimatedTime = stationsTravelled * 3;
            const baseFare = Math.max(20, stationsTravelled * 5);
            const totalFare = baseFare;
            setSearchResults({
                fromStation: getStationName(selectedFrom),
                toStation: getStationName(selectedTo),
                estimatedTime,
                breakdown: {
                    stationsTravelled,
                    baseFare
                },
                totalFare,
                intermediateStations: stations.slice(Math.min(fromIdx, toIdx) + 1, Math.max(fromIdx, toIdx)).map(s => s.name)
            });
        } catch (error) {
            console.error('Error calculating fare:', error);
            alert('Error calculating fare. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStationName = (code) => {
        const station = stations.find(s => s.code === code);
        return station ? station.name : '';
    };

    return (
        <SearchContainer>
            <h2>Plan Your Metro Journey</h2>
            <p>Search for the best route between stations</p>
            
            <SearchForm>
                <InputGroup>
                    <label>From Station</label>
                    <select 
                        value={selectedFrom} 
                        onChange={(e) => setSelectedFrom(e.target.value)}
                    >
                        {stations.map(station => (
                            <option key={station.code} value={station.code}>
                                {station.name} ({station.code})
                            </option>
                        ))}
                    </select>
                </InputGroup>
                
                <SwitchButton onClick={switchStations} title="Switch stations">
                    ⇄
                </SwitchButton>
                
                <InputGroup>
                    <label>To Station</label>
                    <select 
                        value={selectedTo} 
                        onChange={(e) => setSelectedTo(e.target.value)}
                    >
                        {stations.map(station => (
                            <option key={station.code} value={station.code}>
                                {station.name} ({station.code})
                            </option>
                        ))}
                    </select>
                </InputGroup>
                
                <SearchButton onClick={searchRoute} disabled={isLoading}>
                    {isLoading ? 'Searching...' : 'Find Metro Route'}
                </SearchButton>
            </SearchForm>
            
            {searchResults && (
                <ResultsContainer>
                    <div className="journey-path">
                        <div className="station">
                            <div className="station-name">{searchResults.fromStation}</div>
                            <div className="station-code">FROM</div>
                        </div>
                        
                        <div className="path-line"></div>
                        
                        <div className="station">
                            <div className="station-name">{searchResults.toStation}</div>
                            <div className="station-code">TO</div>
                        </div>
                    </div>
                    
                    <div className="fare-details">
                        <div className="fare-card">
                            <h4>Total Stations</h4>
                            <p>{searchResults.breakdown.stationsTravelled}</p>
                        </div>
                        
                        <div className="fare-card">
                            <h4>Estimated Time</h4>
                            <p>{searchResults.estimatedTime} min</p>
                        </div>
                        
                        <div className="fare-card">
                            <h4>Base Fare</h4>
                            <p>₹{searchResults.breakdown.baseFare}</p>
                        </div>
                        
                        <div className="fare-card">
                            <h4>Total Fare</h4>
                            <p>₹{searchResults.totalFare}</p>
                        </div>
                    </div>
                    
                    {searchResults.intermediateStations.length > 0 && (
                        <div style={{ marginTop: '2rem' }}>
                            <h4>Route via:</h4>
                            <div style={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: '0.5rem',
                                marginTop: '1rem'
                            }}>
                                {searchResults.intermediateStations.map((station, index) => (
                                    <span key={index} style={{
                                        background: '#e3f2fd',
                                        color: '#0066b3',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        fontSize: '0.9rem'
                                    }}>
                                        {station}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '1.5rem' }}>
                        <h3>Find Trains</h3>
                        <p>See upcoming trains for your journey</p>
                        <TrainList from={selectedFrom} to={selectedTo} />
                    </div>
                </ResultsContainer>
            )}
        </SearchContainer>
    );
};

export default RouteSearch;