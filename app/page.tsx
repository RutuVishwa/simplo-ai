"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Sparkles, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"

// Function to clean markdown formatting from AI responses
const cleanMarkdown = (text: string): string => {
  return text
    // Remove markdown headers (##, ###, etc.) and convert to plain text
    .replace(/^#{1,6}\s+(.+)$/gm, '$1')
    // Remove bold formatting (**text**)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove italic formatting (*text*)
    .replace(/\*(.*?)\*/g, '$1')
    // Remove code formatting (`text`)
    .replace(/`(.*?)`/g, '$1')
    // Remove links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove horizontal rules (---, ***, etc.)
    .replace(/^[-*_]{3,}$/gm, '')
    // Clean up extra whitespace and normalize line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ChatBot() {
  const [isConfigured] = useState(true) // Always configured now
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        // Read the JSON error payload from the API route
        const err = await response.json()
        throw new Error(typeof err.error === "string" ? err.error : JSON.stringify(err.error, null, 2))
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: error instanceof Error ? `⚠️ ${error.message}` : "⚠️ Unknown error, check console.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (isConfigured) {
        handleSendMessage()
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <div className="container mx-auto max-w-5xl min-h-screen flex flex-col p-4 lg:p-6 relative">
        {/* Header */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Simplo
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Assistant
                    </Badge>
                  </div>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </CardHeader>
        </Card>

        {/* Chat Messages */}
        <Card className="flex-1 flex flex-col shadow-xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm min-h-0">
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            <ScrollArea className="flex-1 p-6 scrollbar-thin min-h-0">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <MessageSquare className="h-10 w-10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                        Welcome to AI Assistant
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-md">
                        I'm your AI assistant. Ask me anything and I'll help you with your questions!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
                          message.role === "user" 
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white" 
                            : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600"
                        }`}
                      >
                        <div className="space-y-3">
                          {message.role === "assistant" ? (
                            <div className="space-y-3">
                              {cleanMarkdown(message.content).split('\n\n').map((paragraph, idx) => {
                                if (!paragraph.trim()) return null;
                                return (
                                  <p key={idx} className="leading-relaxed text-slate-800 dark:text-slate-200 text-sm">
                                    {paragraph}
                                  </p>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          )}
                        </div>
                        <p className={`text-xs mt-3 ${message.role === "user" ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {message.role === "user" && (
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-md">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-4 justify-start">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-5 py-3 border border-slate-200 dark:border-slate-600">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex gap-3">
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!input.trim() || isLoading} 
                  size="icon"
                  className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
