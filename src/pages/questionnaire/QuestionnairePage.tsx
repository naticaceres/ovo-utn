import { sendChatMessage } from 'src/context/api';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import styles from './QuestionnairePage.module.css';
import type { AuthUser } from '../../context/auth-context';

export function QuestionnairePage() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState<
    {
      id: string;
      sender: 'bot' | 'user';
      text: string;
      isRateLimitError?: boolean;
    }[]
  >([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState<string>('');
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

  // Mandar mensaje al backend
  const sendMessage = async (userId: string, prompt: string, cid: string) => {
    setIsLoading(true);
    try {
      const res = await sendChatMessage(userId, prompt, cid);
      // si el backend retorna chat_id, guardarlo y persistir en localStorage
      if (res.chat_id) {
        setChatId(res.chat_id);
        try {
          localStorage.setItem('chat_id', res.chat_id);
        } catch {
          /* ignore */
        }
      }
      // agregar respuesta del bot
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: res.chatbot_response,
        },
      ]);
      if (res.status === 'FINISHED') {
        try {
          if (res.final_scores) {
            localStorage.setItem(
              'final_scores',
              JSON.stringify(res.final_scores)
            );
          }
        } catch {
          /* ignore */
        }
        // opcional: limpiar chat_id de la sesión si corresponde
        try {
          localStorage.removeItem('chat_id');
        } catch {
          /* ignore */
        }
        navigate('/app/results');
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

  const handleStartTest = () => {
    setHasStarted(true);
    const user = localStorage.getItem('user');
    const authUser: AuthUser = user ? JSON.parse(user) : null;
    const userId = authUser.usuario.id;

    // Crear nuevo chat_id para la sesión
    const initialChatId = `sesion-${Date.now()}`;
    setChatId(initialChatId);

    // la primera llamada no envía prompt para obtener la primera pregunta
    sendMessage(userId.toString(), '', initialChatId);
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
    if (!text) return;
    // append user message
    const msgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { id: msgId, sender: 'user', text }]);
    setInput('');
    const user = localStorage.getItem('user');
    const authUser: AuthUser = user ? JSON.parse(user) : null;
    const userId = authUser.usuario.id;
    // enviar al backend
    const cid = chatId || `sesion-${Date.now()}`;
    if (!chatId) {
      try {
        localStorage.setItem('chat_id', cid);
      } catch {
        /* ignore */
      }
      setChatId(cid);
    }
    sendMessage(userId.toString(), text, cid);
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
            <Button variant='secondary' size='lg' className={styles.infoButton}>
              Necesito más información
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
