"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Sparkles, MessageSquare, Image, X, Clipboard, Download } from "lucide-react"
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
  image?: string // Base64 encoded image
}

export default function ChatBot() {
  const [isConfigured] = useState(true) // Always configured now
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showPasteHint, setShowPasteHint] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setSelectedImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePaste = (event: ClipboardEvent) => {
    const items = event.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile()
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result as string
            setSelectedImage(result)
            setShowPasteHint(true)
            setTimeout(() => setShowPasteHint(false), 3000)
          }
          reader.readAsDataURL(file)
        }
        break
      }
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const downloadChat = () => {
    if (messages.length === 0) return

    const formatTimestamp = (date: Date) => {
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    let chatContent = `Simplo AI Assistant - Chat Export\n`
    chatContent += `Generated on: ${new Date().toLocaleString()}\n`
    chatContent += `Total messages: ${messages.length}\n`
    chatContent += `\n${'='.repeat(50)}\n\n`

    messages.forEach((message, index) => {
      const role = message.role === 'user' ? 'You' : 'AI Assistant'
      const timestamp = formatTimestamp(message.timestamp)
      const content = cleanMarkdown(message.content)
      
      chatContent += `[${timestamp}] ${role}:\n`
      if (message.image) {
        chatContent += `[Image attached]\n`
      }
      chatContent += `${content}\n\n`
    })

    const blob = new Blob([chatContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `simplo-chat-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    const handleGlobalPaste = (event: ClipboardEvent) => {
      // Only handle paste if the input is focused or if we're in the chat area
      if (inputRef.current?.contains(event.target as Node) || 
          document.querySelector('.chat-container')?.contains(event.target as Node)) {
        handlePaste(event)
      }
    }

    document.addEventListener('paste', handleGlobalPaste)
    return () => {
      document.removeEventListener('paste', handleGlobalPaste)
    }
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedImage) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
      image: selectedImage || undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
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
            image: msg.image,
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
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <Button
                    onClick={downloadChat}
                    size="sm"
                    variant="outline"
                    className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
                    title="Download chat"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                )}
                <ThemeToggle />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Chat Messages */}
        <Card className="flex-1 flex flex-col shadow-xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm min-h-0 chat-container">
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
                        I'm your AI assistant. Ask me anything, upload images, or paste images from clipboard!
                      </p>
                      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                        <Clipboard className="h-3 w-3" />
                        <span>Ctrl+V to paste images</span>
                      </div>
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
                          {message.image && (
                            <div className="mb-3">
                              <img 
                                src={message.image} 
                                alt="Uploaded image" 
                                className="max-w-full h-auto rounded-lg max-h-64 object-cover"
                              />
                            </div>
                          )}
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
              {showPasteHint && (
                <div className="mb-3 p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm flex items-center gap-2">
                  <Clipboard className="h-4 w-4" />
                  Image pasted from clipboard!
                </div>
              )}
              {selectedImage && (
                <div className="mb-3 relative inline-block">
                  <img 
                    src={selectedImage} 
                    alt="Selected image" 
                    className="max-w-32 h-auto rounded-lg max-h-24 object-cover"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  placeholder="Type your message or paste an image (Ctrl+V)..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isLoading}
                  size="icon"
                  variant="outline"
                  className="h-12 w-12 rounded-xl border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
                  title="Upload image"
                >
                  <Image className="h-5 w-5" />
                </Button>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={(!input.trim() && !selectedImage) || isLoading} 
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
