import React, { useEffect, useState } from 'react';
import axios from 'axios';
import metroTrainsData from '../../data/metroTrains.json';

const TrainList = ({ from, to }) => {
    const [trains, setTrains] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!from || !to) return;
        fetchTrains();
        // eslint-disable-next-line
    }, [from, to]);

    const fetchTrains = async () => {
        setLoading(true);
        try {
            const resp = await axios.get('/mock-api/metro_trains.json');
            const data = resp.data || [];

            // Filter trains that serve both stations in order
            const matches = data.map(t => {
                const route = t.route || [];
                const fromIdx = route.indexOf(from);
                const toIdx = route.indexOf(to);
                return { train: t, fromIdx, toIdx };
            }).filter(x => x.fromIdx >= 0 && x.toIdx >= 0 && x.fromIdx < x.toIdx)
              .map(x => ({
                  id: x.train.id,
                  name: x.train.name,
                  fromIdx: x.fromIdx,
                  toIdx: x.toIdx,
                  upcoming: x.train.upcoming || []
              }));

            setTrains(matches);
        } catch (err) {
            console.error('Error fetching trains', err);
            // fallback to local data
            const data = metroTrainsData || [];

            const matches = data.map(t => {
                const route = t.route || [];
                const fromIdx = route.indexOf(from);
                const toIdx = route.indexOf(to);
                return { train: t, fromIdx, toIdx };
            }).filter(x => x.fromIdx >= 0 && x.toIdx >= 0 && x.fromIdx < x.toIdx)
              .map(x => ({
                  id: x.train.id,
                  name: x.train.name,
                  fromIdx: x.fromIdx,
                  toIdx: x.toIdx,
                  upcoming: x.train.upcoming || []
              }));

            setTrains(matches);
        } finally {
            setLoading(false);
        }
    };

    if (!from || !to) return null;

    return (
        <div style={{ marginTop: '1rem' }}>
            <h4>Upcoming trains from {from} to {to}</h4>
            {loading && <div>Loading trains...</div>}
            {!loading && trains.length === 0 && <div>No upcoming direct trains found.</div>}
            <ul>
                {trains.map(t => (
                    <li key={t.id} style={{ marginBottom: '0.6rem' }}>
                        <strong>{t.name}</strong> ({t.id}) — Stops: {t.toIdx - t.fromIdx}
                        <div style={{ fontSize: '0.9rem', color: '#555' }}>
                            Next departures: {t.upcoming.slice(0,3).map(u => u.departure).join(', ') || 'N/A'}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TrainList;
