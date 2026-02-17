import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import { ReactMediaRecorder } from "react-media-recorder";
import {
  VerifyCustomerAPI,
  AskQuestionAPI,
  SubmitEscalationFormAPI,
  EndChatSummaryAPI,
  SpeachToText,
  ContinueForNotVerified,
} from "../UserServices/UserServices";
import NonVerifiedLeadsForm from "../NonVerifiedLeadsForm";

export const ChatScreen = () => {
  const chatRef = useRef(null);
  const { orgId, org_name } = useParams();
  const decodedOrgName = org_name ? decodeURIComponent(org_name) : "";
  const [messages, setMessages] = useState([
    { sender: "AI", message: "Enter your details:" },
  ]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isAdminReplying, setIsAdminReplying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [chatBlocked, setChatBlocked] = useState(false);
  const [customer_id, setcustomerid] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const silenceTimer = useRef(null);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [showLangOptions, setShowLangOptions] = useState(false);
  const startRecordingRef = useRef(null);
  const stopRecordingRef = useRef(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [allowNonVerifiedChat, setAllowNonVerifiedChat] = useState(false);
  const [showNotVerifiedModal, setShowNotVerifiedModal] = useState(false);

  const [verifyForm, setVerifyForm] = useState({
    name: "",
    email: "",
    phone: "",
    org_id: orgId || "",
  });

  const languages = [
    { name: "English (US)", code: "en-US" },
    { name: "Spanish (Spain)", code: "es-ES" },
    { name: "Spanish (Mexico)", code: "es-MX" },
    { name: "Portuguese (Brazil)", code: "pt-BR" },
  ];

  const [escalationForm, setEscalationForm] = useState({
    form_title: "",
    form_description: {
      Query_description: "",
      issue_category: "",
      service_name: "",
      priority: "",
    },
    Ai_agent_solution: "",
  });

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setShowLangOptions(false);
    };
    recognition.onend = () => {
      setIsListening(false);
      setShowLangOptions(false);
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[event.results.length - 1][0].transcript;
      setMessage(spokenText);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setShowLangOptions(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
    recognitionRef.current.lang = lang.code;
    recognitionRef.current.start();
    setShowLangOptions(false);
  };

  useEffect(() => scrollToBottom(), [messages, isAdminReplying]);

  const handleVerifyCustomer = async () => {
    const { name, email, phone } = verifyForm;

    if (!name || !email || !phone) {
      toast.warning("All fields are required!");
      return;
    }

    try {
      setIsSending(true);

      const res = await VerifyCustomerAPI(verifyForm);
      const data = res?.data;

      if (data?.status === "verified") {
        setIsVerified(true);
        setcustomerid(data.customer_id);
        setCustomerName(data.name);

        toast.success(data.message);

        setMessages((prev) => [
          ...prev,
          { sender: "AI", message: data.message },
        ]);
      } else {
        setShowNotVerifiedModal(true);
      }
    } catch (err) {
      const status = err?.response?.status;

      if (status === 400 || status === 404) {
        setShowNotVerifiedModal(true);
        return;
      }
      toast.error("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || chatBlocked || formSubmitted || isSending) return;

    const userMsg = { sender: "User", message };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setIsAdminReplying(true);
    setIsSending(true);

    try {
      let res;

      if (isVerified) {
        res = await AskQuestionAPI({
          customer_id,
          org_id: verifyForm.org_id,
          question: userMsg.message,
        });
      } else if (allowNonVerifiedChat) {
        res = await ContinueForNotVerified({
          org_id: verifyForm.org_id,
          question: userMsg.message,
        });
      }

      const data = res?.data;

      if (data?.answer) {
        setMessages((prev) => [
          ...prev,
          { sender: "AI", message: data.answer },
        ]);
      } else {
        toast.warning("No response from assistant.");
      }
    } catch (err) {
      toast.error("Failed to send message.");
    } finally {
      setIsSending(false);
      setIsAdminReplying(false);
    }
  };
  useEffect(() => {
    const handleChatEnd = () => {
      if (!messages.length || !customer_id) return;

      const conversation_text = JSON.stringify(messages, null, 2);

      const summaryPayload = {
        customer_id,
        conversation_text,
      };

      EndChatSummaryAPI(summaryPayload);
    };

    window.addEventListener("beforeunload", handleChatEnd);

    return () => {
      window.removeEventListener("beforeunload", handleChatEnd);
    };
  }, [messages, customer_id]);

  const handleSubmitEscalation = async () => {
    try {
      const payload = {
        customer_id: customer_id,
        org_id: Number(orgId),
        form_title: escalationForm.form_title,

        form_description: {
          Query_description: escalationForm.form_description.Query_description,
          issue_category: escalationForm.form_description.issue_category,
          service_name: escalationForm.form_description.service_name,
          priority: escalationForm.form_description.priority,
        },

        Ai_agent_solution: escalationForm.Ai_agent_solution,
      };

      const res = await SubmitEscalationFormAPI(payload);

      const form_id = res?.data?.form_id;

      if (!form_id) {
        toast.error("form_id missing from server response!");
        return;
      }

      const conversation_text = JSON.stringify(messages, null, 2);

      await EndChatSummaryAPI({
        form_id,
        customer_id,
        conversation_text,
      });

      toast.success("Escalation form submitted successfully!");
      setShowEscalationModal(false);
      setFormSubmitted(true);
    } catch (err) {
      console.error("Escalation submit error ", err?.response?.data || err);
      toast.error("Failed to submit escalation form");
    }
  };

  const hasBlockedMessage = messages.some(
    (msg) =>
      msg.sender === "AI" &&
      msg.message.includes(
        "Customer not found. Please ask your organization to register you first.",
      ),
  );

  const handleSpeechStop = async (blobUrl, blob) => {
    const mp3Blob = new Blob([blob], { type: "audio/mpeg" });
    const formData = new FormData();
    formData.append("audio", mp3Blob, "recording.mp3");

    try {
      setIsProcessingAudio(true);

      const res = await SpeachToText(formData);
      const text = res?.data?.text;

      if (text) {
        setMessage(text);
      }
    } catch (err) {
      toast.error("Speech to text failed");
    } finally {
      setIsProcessingAudio(false);
    }
  };

  useEffect(() => {
    if (isRecording) {
      clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => {
        stopRecordingRef.current?.();
        setIsRecording(false);
      }, 6000);
    }
  }, [isRecording]);

  return (
    <>
      <div className="sticky-top text-white shadow-sm py-3 px-4">
        <div className="row align-items-center text-center text-md-start">
          <div className="col-12 col-md-6">
            <h4 className="fw-bold ai_heading"> Customer Query AI Chatbot</h4>
          </div>

          <div className="col-12 col-md-6 mt-2 mt-md-0 text-md-end">
            <h5 className="orgnization">
              <strong>Organization:</strong> {decodedOrgName}
            </h5>
            <h5 className="orgnization">
              <strong>Your Name:</strong> {customerName}
            </h5>
          </div>
        </div>
      </div>

      <div
        className="container-fluid py-3"
        style={{ height: "calc(100vh - 64px)" }}
      >
        <div className="row h-100">
          <div className="col-12 d-flex flex-column h-100">
            <div className=" chatbox " ref={chatRef}>
              {messages.map((msg, i) => {
                const adminMessageCountUpToNow = messages
                  .slice(0, i + 1)
                  .filter((m) => m.sender === "AI").length;

                const showEscalationPrompt =
                  adminMessageCountUpToNow >= 3 &&
                  !hasBlockedMessage &&
                  msg.sender === "AI";

                return (
                  <div
                    key={i}
                    className={`mb-3 d-flex ${
                      msg.sender === "AI"
                        ? "justify-content-start"
                        : "justify-content-end"
                    }`}
                  >
                    <div
                      className={`chatbox_msg  ${
                        msg.sender === "AI"
                          ? "bg-white border"
                          : "chat_msg text-white"
                      }`}
                    >
                      <ReactMarkdown>{msg.message}</ReactMarkdown>

                      {showEscalationPrompt && (
                        <div
                          className="mt-2 text-primary small fw-semibold cursor-pointer"
                          style={{ cursor: "pointer" }}
                          onClick={() => setShowEscalationModal(true)}
                        >
                          Not satisfied? Submit escalation form →
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isAdminReplying && (
                <div className="d-flex justify-content-start mb-3">
                  <div className="bg-white border rounded-4 px-4 py-2 shadow-sm d-flex align-items-center">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    AI Agent is typing...
                  </div>
                </div>
              )}
            </div>

            {!isVerified && !allowNonVerifiedChat && !hasBlockedMessage && (
              <div className="d-flex justify-content-end align-items-center flex-grow-1">
                <div className="col-md-3 bg-white border rounded-4 p-4 py-4 shadow">
                  <h5 className="text-center fw-bold mb-3">
                    Verify Your Details
                  </h5>

                  {["name", "email", "phone"].map((field) => (
                    <div key={field} className="mb-3">
                      <input
                        className="form-control rounded-pill py-2"
                        placeholder={
                          field.charAt(0).toUpperCase() + field.slice(1)
                        }
                        value={verifyForm[field]}
                        onChange={(e) =>
                          setVerifyForm({
                            ...verifyForm,
                            [field]: e.target.value,
                          })
                        }
                      />
                    </div>
                  ))}

                  <button
                    className="btn verify-btn"
                    onClick={handleVerifyCustomer}
                    disabled={isSending}
                  >
                    {isSending ? "Verifying..." : "Verify & Continue"}
                  </button>

                  <div className="not-customer-text">
                    If you are not customer of this organization then please{" "}
                    <span
                      className="submit-leads-link"
                      onClick={() => {
                        setShowEscalationModal(true);
                      }}
                    >
                      submit leads form
                    </span>
                  </div>
                </div>
              </div>
            )}

            {(isVerified || allowNonVerifiedChat) &&
              !hasBlockedMessage &&
              !formSubmitted && (
                <div className="sticky-bottom">
                  <div className="">
                    <div className="d-flex align-items-center rounded-pill px-3 py-1 border shadow-sm bg-white">
                      <textarea
                        rows={1}
                        className="form-control border-0 shadow-none me-2"
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />

                      <div className="position-relative">
                        {showLangOptions && (
                          <div className="language-popup">
                            {languages.map((lang) => (
                              <div
                                key={lang.code}
                                className="p-1 rounded hover-bg-primary"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleLanguageSelect(lang)}
                              >
                                {lang.name}
                              </div>
                            ))}
                          </div>
                        )}

                        <ReactMediaRecorder
                          audio
                          blobPropertyBag={{ type: "audio/mpeg" }}
                          onStop={handleSpeechStop}
                          render={({ startRecording, stopRecording }) => {
                            startRecordingRef.current = startRecording;
                            stopRecordingRef.current = stopRecording;

                            return (
                              <button
                                type="button"
                                className={`me-2 ${
                                  isRecording ? "btn-danger" : "mike_btn"
                                }`}
                                onClick={() => {
                                  if (isRecording) {
                                    stopRecording();
                                    setIsRecording(false);
                                  } else {
                                    startRecording();
                                    setIsRecording(true);
                                  }
                                }}
                              >
                                {isProcessingAudio ? (
                                  <div className="spinner-border spinner-border-sm text-light" />
                                ) : (
                                  <i className="bi bi-mic-fill"></i>
                                )}
                              </button>
                            );
                          }}
                        />
                      </div>
                      <button
                        className="btn msg_send_btn "
                        onClick={handleSendMessage}
                        disabled={isSending || !message.trim()}
                      >
                        {isSending ? (
                          <div className="spinner-border spinner-border-sm text-light" />
                        ) : (
                          <i className="bi bi-send-fill"></i>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {formSubmitted && (
              <div className="position-fixed bottom-0 start-0 w-100 p-3 bg-success text-white text-center shadow">
                Thank you! Your escalation form has been submitted.
              </div>
            )}

            {hasBlockedMessage && (
              <div className="alert alert-danger text-center rounded-4 shadow-sm mt-3">
                <i className="bi bi-shield-exclamation me-2"></i>
                Access denied. Please contact your organization to register
                first.
              </div>
            )}
            {showEscalationModal && !isVerified && (
              <NonVerifiedLeadsForm
                orgId={orgId}
                onClose={() => setShowEscalationModal(false)}
                onSuccess={() => setFormSubmitted(true)}
              />
            )}

            {showEscalationModal && isVerified && (
              <div
                className="modal fade show d-block"
                style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              >
                <div className="modal-dialog modal-dialog-centered modal-lg">
                  <div className="modal-content rounded-4 border-0 shadow-lg">
                    <div className="modal-header bg-primary text-white rounded-top-4">
                      <h5 className="modal-title text-white fw-bold">
                        Escalation Form
                      </h5>
                      <button
                        className="btn-close btn-close-white"
                        onClick={() => setShowEscalationModal(false)}
                      />
                    </div>

                    <div className="modal-body p-4">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Form Title
                        </label>
                        <input
                          className="form-control rounded-pill shadow-sm"
                          placeholder="Enter Form Title"
                          value={escalationForm.form_title}
                          onChange={(e) =>
                            setEscalationForm({
                              ...escalationForm,
                              form_title: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Query Description
                        </label>
                        <input
                          className="form-control rounded-pill shadow-sm"
                          placeholder="Describe your query"
                          value={
                            escalationForm.form_description.Query_description
                          }
                          onChange={(e) =>
                            setEscalationForm({
                              ...escalationForm,
                              form_description: {
                                ...escalationForm.form_description,
                                Query_description: e.target.value,
                              },
                            })
                          }
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Issue Category
                        </label>
                        <input
                          className="form-control rounded-pill shadow-sm"
                          placeholder="Enter Issue Category"
                          value={escalationForm.form_description.issue_category}
                          onChange={(e) =>
                            setEscalationForm({
                              ...escalationForm,
                              form_description: {
                                ...escalationForm.form_description,
                                issue_category: e.target.value,
                              },
                            })
                          }
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Service Name
                        </label>
                        <input
                          className="form-control rounded-pill shadow-sm"
                          placeholder="Enter Service Name"
                          value={escalationForm.form_description.service_name}
                          onChange={(e) =>
                            setEscalationForm({
                              ...escalationForm,
                              form_description: {
                                ...escalationForm.form_description,
                                service_name: e.target.value,
                              },
                            })
                          }
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Priority
                        </label>
                        <select
                          className="form-select rounded-pill shadow-sm"
                          value={escalationForm.form_description.priority}
                          onChange={(e) =>
                            setEscalationForm({
                              ...escalationForm,
                              form_description: {
                                ...escalationForm.form_description,
                                priority: e.target.value,
                              },
                            })
                          }
                        >
                          <option value="">Select Priority</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          What AI Replied?
                        </label>
                        <textarea
                          className="form-control rounded-3 shadow-sm"
                          placeholder="Paste AI's response here"
                          rows={4}
                          value={escalationForm.Ai_agent_solution}
                          onChange={(e) =>
                            setEscalationForm({
                              ...escalationForm,
                              Ai_agent_solution: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button
                        className="btn btn-outline-secondary rounded-pill px-4"
                        onClick={() => setShowEscalationModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary rounded-pill px-4"
                        onClick={handleSubmitEscalation}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showNotVerifiedModal && (
              <div className="modal fade show d-block custom-modal-backdrop">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content rounded-4 border-0 shadow-lg">
                    <div className="modal-header not-verified-modal-header rounded-top-4">
                      <h5 className="modal-title fw-bold">Account Not Found</h5>
                      <button
                        className="btn-close"
                        onClick={() => setShowNotVerifiedModal(false)}
                      />
                    </div>

                    <div className="modal-body p-4 text-center">
                      <p className="fw-semibold mb-2">
                        We could not find an account associated with your
                        credentials.
                      </p>
                      <p className="mb-2">
                        Please enter your contact information and which service
                        you are inquiring about.
                      </p>
                      <p className="mb-3">
                        One of our associates will contact you shortly.
                      </p>
                      <p className="fw-semibold">Thank you</p>

                      <div className="mt-4">
                        <span
                          className="not-verified-escalation-link"
                          onClick={() => {
                            setShowNotVerifiedModal(false);
                            setShowEscalationModal(true);
                          }}
                        >
                          Submit Leads Form →
                        </span>
                      </div>
                    </div>
                    <div className="modal-footer justify-content-center">
                      <button
                        className="btn btn-outline-secondary rounded-pill px-4"
                        onClick={() => setShowNotVerifiedModal(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
