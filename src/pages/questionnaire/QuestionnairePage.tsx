import { startTest, submitTestAnswer } from '../../context/api';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import styles from './QuestionnairePage.module.css';
import { useAuth } from '../../context/use-auth';

export function QuestionnairePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState<
    {
      id: string;
      sender: 'bot' | 'user';
      text: string;
      isRateLimitError?: boolean;
    }[]
  >([]);
  const [input, setInput] = useState('');
  const [idTest, setIdTest] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Helper: render text with newlines and simple **bold** tokens
  const renderFormattedText = (text: string) => {
    // split by lines
    return text.split('\n').map((line, idx) => {
      // replace **bold** occurrences with <strong>
      const parts: (string | React.ReactElement)[] = [];
      const boldRegex = /\*\*(.+?)\*\*/g;
      let lastIndex = 0;
      let match;
      while ((match = boldRegex.exec(line)) !== null) {
        const [full, inner] = match;
        const start = match.index;
        if (start > lastIndex) {
          parts.push(line.slice(lastIndex, start));
        }
        parts.push(<strong key={idx + '-' + start}>{inner}</strong>);
        lastIndex = start + full.length;
      }
      if (lastIndex < line.length) parts.push(line.slice(lastIndex));
      return (
        <p key={idx} className={styles.messageText}>
          {parts.map(p => (typeof p === 'string' ? p : p))}
        </p>
      );
    });
  };

  // Mandar respuesta al backend
  const sendAnswer = async (answer: string) => {
    if (!idTest) {
      console.error('No hay idTest disponible');
      return;
    }

    setIsLoading(true);
    try {
      const res = await submitTestAnswer(idTest, answer);

      // Manejar la respuesta del bot
      if (res.data.fullHistory && res.data.fullHistory.length > 0) {
        // Si hay historia completa, reemplazar todos los mensajes
        const newMessages = res.data.fullHistory.map(
          (msg: string, index: number) => ({
            id: `history-${index}`,
            sender: msg.startsWith('Usuario:')
              ? 'user'
              : ('bot' as 'bot' | 'user'),
            text: msg.replace(/^(Usuario:|Asistente:)\s*/, ''),
          })
        );
        setMessages(newMessages);
      } else if (res.data.nextQuestion) {
        // Si hay siguiente pregunta, agregarla
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: res.data.nextQuestion || '',
          },
        ]);
      }

      // Verificar si el test finalizó (código 201)
      if (res.status === 201) {
        // Agregar mensaje final si existe
        if (res.data.message) {
          setMessages(prev => [
            ...prev,
            {
              id: `bot-final-${Date.now()}`,
              sender: 'bot',
              text: res.data.message || 'Test finalizado.',
            },
          ]);
        }

        // Esperar un momento para que el usuario vea el mensaje final
        setTimeout(() => {
          // Verificar si el usuario está logueado
          if (user) {
            // Si está logueado, ir directo a resultados
            navigate('/app/results');
          } else {
            // Si no está logueado, redirigir a register manteniendo el idTest
            navigate('/app/register');
          }
        }, 2000);
      }
    } catch (error: unknown) {
      let errorMessage =
        'Error al comunicarse con el servidor. Intenta de nuevo.';

      // Verificar si es error 429 (Too Many Requests)
      if (
        error instanceof Error &&
        (error.message.includes('429') ||
          (error as Error & { status?: number }).status === 429)
      ) {
        errorMessage =
          'Se han agotado los intentos gratuitos por el día. Por favor, intenta nuevamente mañana.';
      }

      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: errorMessage,
          isRateLimitError: errorMessage.includes(
            'agotado los intentos gratuitos'
          ),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTest = async () => {
    setHasStarted(true);
    setIsLoading(true);

    try {
      // Llamar al endpoint (funciona tanto para usuarios autenticados como anónimos)
      const res = await startTest();

      // Guardar idTest en el estado y localStorage
      setIdTest(res.idTest);
      localStorage.setItem('testId', res.idTest.toString());

      // Agregar mensajes de la historia completa o mensaje inicial
      if (res.fullHistory && res.fullHistory.length > 0) {
        const initialMessages = res.fullHistory.map(
          (msg: string, index: number) => ({
            id: `history-${index}`,
            sender: msg.startsWith('Usuario:')
              ? 'user'
              : ('bot' as 'bot' | 'user'),
            text: msg.replace(/^(Usuario:|Asistente:)\s*/, ''),
          })
        );
        setMessages(initialMessages);
      } else if (res.chatbot_response) {
        setMessages([
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: res.chatbot_response,
          },
        ]);
      } else {
        setMessages([
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: 'Test iniciado. Por favor, responde las siguientes preguntas.',
          },
        ]);
      }
    } catch (error) {
      console.error('Error en handleStartTest:', error);
      setMessages([
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: 'Error al iniciar el test. Intenta de nuevo.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // scroll al final al añadir mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || !idTest) return;

    // Agregar mensaje del usuario
    const msgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { id: msgId, sender: 'user', text }]);
    setInput('');

    // Enviar respuesta al backend
    sendAnswer(text);
  };

  if (!hasStarted) {
    return (
      <div className={styles.questionnaireCard}>
        <header className={styles.header}>
          <h1 className={styles.title}>Test de Orientación Vocacional</h1>
          <div className={styles.statusBar}>
            <span className={styles.status}>Iniciando test...</span>
            <span className={styles.timeEstimate}>
              Tiempo estimado: 25-30 min
            </span>
          </div>
        </header>

        <div className={styles.welcomeSection}>
          <div className={styles.assistantHeader}>
            <div className={styles.assistantAvatar}>
              <div className={styles.avatarIcon}>🤖</div>
            </div>
            <div className={styles.assistantInfo}>
              <h2 className={styles.assistantName}>Asistente OVO</h2>
              <span className={styles.assistantStatus}>Conectado</span>
            </div>
          </div>

          <div className={styles.welcomeMessage}>
            <p className={styles.greeting}>
              ¡Hola! Soy tu asistente de orientación vocacional.{' '}
              <span className={styles.gIcon}>G</span>
            </p>
            <p className={styles.description}>
              Vamos a descubrir juntos cuáles son tus talentos y preferencias
              profesionales. Este proceso tomará aproximadamente 25-30 minutos.
            </p>

            <div className={styles.howItWorks}>
              <h3>¿Cómo funciona?</h3>
              <ul>
                <li>
                  Te haré un máximo de 50 preguntas sobre tus intereses,
                  habilidades y preferencias
                </li>
                <li>Las preguntas se adaptan a tus respuestas</li>
                <li>
                  Tu progreso se guarda automáticamente después de cada
                  respuesta
                </li>
                <li>Puedes pausar cuando quieras</li>
                <li>
                  Al final recibirás tu perfil de aptitudes y carreras
                  compatibles
                </li>
              </ul>
            </div>

            <p className={styles.readyQuestion}>¿Estás listo para comenzar?</p>
          </div>

          <div className={styles.actionButtons}>
            <Button
              onClick={handleStartTest}
              variant='primary'
              size='lg'
              className={styles.startButton}
            >
              Sí, empezar el test
            </Button>
          </div>
        </div>

        <footer className={styles.footer}>
          <span className={styles.autoSave}>
            <span className={styles.saveIcon}>💾</span>
            Guardado automático activado
          </span>
          <span className={styles.separator}>|</span>
          <span className={styles.pauseInfo}>
            <span className={styles.pauseIcon}>⏸️</span>
            Puedes pausar en cualquier momento
          </span>
        </footer>
      </div>
    );
  }

  return (
    <div className={styles.questionnaireCard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Test de Orientación Vocacional</h1>
        <div className={styles.statusBar}>
          <span className={styles.status}>En progreso...</span>
          <span className={styles.timeEstimate}>
            Tiempo estimado: 25-30 min
          </span>
        </div>
      </header>

      <div className={styles.chatContainer}>
        <div className={styles.messages} ref={scrollRef}>
          {messages.map(m => (
            <div
              key={m.id}
              className={
                m.sender === 'bot'
                  ? styles.botMessageContainer
                  : styles.userMessageContainer
              }
            >
              <div
                className={
                  m.sender === 'bot'
                    ? m.isRateLimitError
                      ? styles.botMessageRateLimit
                      : styles.botMessage
                    : styles.userMessage
                }
              >
                {/* renderizado mejorado: mantener saltos de línea y **bold** */}
                {m.sender === 'bot'
                  ? renderFormattedText(m.text)
                  : m.text.split('\n').map((line, i) => (
                      <p key={i} className={styles.messageText}>
                        {line}
                      </p>
                    ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={styles.botMessageContainer}>
              <div className={styles.botMessage}>
                <p className={styles.messageText}>
                  El asistente está escribiendo...
                </p>
              </div>
            </div>
          )}
        </div>

        <form className={styles.chatInputSection} onSubmit={handleSend}>
          <input
            type='text'
            value={input}
            onChange={e => setInput(e.target.value)}
            className={styles.chatInput}
            placeholder='Escribe tu respuesta...'
            disabled={isLoading}
          />
          <Button
            type='submit'
            variant='primary'
            size='md'
            disabled={!input.trim() || isLoading}
            isLoading={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
