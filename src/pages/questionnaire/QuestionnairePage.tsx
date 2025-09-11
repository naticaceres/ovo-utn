import { useQuery, useMutation } from '@tanstack/react-query';
import { questionnaireApi } from 'src/context/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import styles from './QuestionnairePage.module.css';

export function QuestionnairePage() {
  const { data: questions, isLoading } = useQuery({
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
    onSuccess: () => navigate('/app/results'),
  });

  const onSubmit = () => {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).id : 0;
    submitMutation.mutate({ userId, values: answers });
  };

  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Cargando cuestionario...</p>
      </div>
    );
  }

  return (
    <div className={styles.questionnaireContainer}>
      <div className={styles.questionnaireCard}>
        <header className={styles.header}>
          <h1 className={styles.title}>Cuestionario Vocacional</h1>
          <p className={styles.subtitle}>
            Responde las siguientes preguntas para descubrir tu vocación
          </p>
        </header>

        {questions && (
          <form
            className={styles.form}
            onSubmit={e => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <div className={styles.questionsList}>
              {questions.map((question, index) => (
                <div key={question.id} className={styles.questionItem}>
                  <div className={styles.questionHeader}>
                    <span className={styles.questionNumber}>
                      Pregunta {index + 1} de {questions.length}
                    </span>
                    <h3 className={styles.questionText}>{question.text}</h3>
                  </div>

                  <div className={styles.answerSection}>
                    <div className={styles.scaleLabels}>
                      <span>Muy en desacuerdo</span>
                      <span>Muy de acuerdo</span>
                    </div>

                    <input
                      type='range'
                      min={1}
                      max={5}
                      value={answers[question.id] ?? 3}
                      onChange={e =>
                        handleAnswerChange(question.id, Number(e.target.value))
                      }
                      className={styles.rangeInput}
                    />

                    <div className={styles.scaleValues}>
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.submitSection}>
              <Button
                type='submit'
                disabled={!questions || submitMutation.isPending}
                variant='primary'
                size='lg'
                fullWidth
                isLoading={submitMutation.isPending}
              >
                {submitMutation.isPending ? 'Enviando...' : 'Enviar Respuestas'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
