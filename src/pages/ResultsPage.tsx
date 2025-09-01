import { useQuery } from '@tanstack/react-query';
import { resultsApi } from '@/lib/api';

export function ResultsPage() {
  const { data: recs } = useQuery({
    queryKey: ['recommendations'],
    queryFn: resultsApi.getRecommendations,
  });

  return (
    <section>
      <h2>Resultados</h2>
      <p>Mapa de aptitudes (placeholder)</p>
      {!recs ? (
        <p>Cargando...</p>
      ) : (
        <ul>
          {recs.map(r => (
            <li key={r.id}>
              <strong>{r.career}</strong> — {r.university} —{' '}
              <a href={r.link} target='_blank' rel='noreferrer'>
                Ver
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
