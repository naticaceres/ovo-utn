import { useQuery, useMutation } from '@tanstack/react-query';
import { questionnaireApi } from '@/lib/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function QuestionnairePage() {
  const { data: questions } = useQuery({
    queryKey: ['questions'],
    queryFn: questionnaireApi.getQuestions,
  });
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const navigate = useNavigate();
  const submitMutation = useMutation({
    mutationFn: (payload: { userId: number; values: Record<number, number> }) =>
      questionnaireApi.submitAnswers(
        payload.userId,
        Object.entries(payload.values).map(([id, value]) => ({
          questionId: Number(id),
          value,
        }))
      ),
    onSuccess: () => navigate('/results'),
  });

  const onSubmit = () => {
    const user = sessionStorage.getItem('user');
    const userId = user ? JSON.parse(user).id : 0;
    submitMutation.mutate({ userId, values: answers });
  };

  return (
    <section>
      <h2>Cuestionario</h2>
      {!questions ? (
        <p>Cargando...</p>
      ) : (
        <ul>
          {questions.map(q => (
            <li key={q.id}>
              <label>
                {q.text}
                <input
                  type='range'
                  min={1}
                  max={5}
                  value={answers[q.id] ?? 3}
                  onChange={e =>
                    setAnswers(prev => ({
                      ...prev,
                      [q.id]: Number(e.target.value),
                    }))
                  }
                />
              </label>
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={onSubmit}
        disabled={!questions || submitMutation.isPending}
      >
        Enviar
      </button>
    </section>
  );
}
