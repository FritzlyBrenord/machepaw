"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  X,
  User,
  Bot,
  AlertCircle,
  ChevronLeft,
  Flag,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { useAdminConversations } from "@/store/adminStore";
import { cn, formatDate } from "@/lib/utils";
import type { AdminConversation } from "@/data/types";

const statusConfig = {
  open: { label: "Ouvert", color: "bg-green-100 text-green-700" },
  pending: { label: "En attente", color: "bg-amber-100 text-amber-700" },
  closed: { label: "Fermé", color: "bg-gray-100 text-gray-700" },
};

const priorityConfig = {
  low: { label: "Basse", color: "bg-blue-100 text-blue-700" },
  medium: { label: "Moyenne", color: "bg-amber-100 text-amber-700" },
  high: { label: "Haute", color: "bg-red-100 text-red-700" },
};

export default function AdminConversationsPage() {
  const conversations = useAdminConversations();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<AdminConversation | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? conv.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      // Add message logic here
      setNewMessage("");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Conversations
            </h1>
            <p className="text-neutral-500">
              Gérez les conversations avec les utilisateurs
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <p className="text-sm text-neutral-500">Total</p>
            <p className="text-2xl font-semibold text-neutral-900">
              {conversations.length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <p className="text-sm text-neutral-500">Ouvertes</p>
            <p className="text-2xl font-semibold text-green-600">
              {conversations.filter((c) => c.status === "open").length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <p className="text-sm text-neutral-500">En attente</p>
            <p className="text-2xl font-semibold text-amber-600">
              {conversations.filter((c) => c.status === "pending").length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <p className="text-sm text-neutral-500">Automatisées</p>
            <p className="text-2xl font-semibold text-blue-600">
              {conversations.filter((c) => c.isAutomated).length}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-lg border border-neutral-200 overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-neutral-200 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
                />
              </div>
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
              >
                <option value="">Tous les statuts</option>
                <option value="open">Ouvert</option>
                <option value="pending">En attente</option>
                <option value="closed">Fermé</option>
              </select>
            </div>

            {/* List */}
            <div className="overflow-y-auto h-[calc(100%-110px)]">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-neutral-500">
                  Aucune conversation trouvée
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={cn(
                      "w-full p-4 text-left border-b border-neutral-100 hover:bg-neutral-50 transition-colors",
                      selectedConversation?.id === conv.id &&
                        "bg-neutral-50 border-l-4 border-l-neutral-900",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                        {conv.userAvatar ? (
                          <img
                            src={conv.userAvatar}
                            alt={conv.userName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-neutral-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-neutral-900 truncate">
                            {conv.userName}
                          </p>
                          {conv.isAutomated && (
                            <Bot className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-neutral-500 truncate">
                          {conv.subject}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1 truncate">
                          {conv.lastMessage}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={cn(
                              "px-2 py-0.5 text-xs rounded-full",
                              statusConfig[conv.status].color,
                            )}
                          >
                            {statusConfig[conv.status].label}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-0.5 text-xs rounded-full",
                              priorityConfig[conv.priority].color,
                            )}
                          >
                            {priorityConfig[conv.priority].label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Conversation Detail */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-200 overflow-hidden">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                      {selectedConversation.userAvatar ? (
                        <img
                          src={selectedConversation.userAvatar}
                          alt={selectedConversation.userName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-neutral-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">
                        {selectedConversation.userName}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {selectedConversation.subject}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedConversation.status}
                      onChange={(e) => {
                        // Update status logic
                      }}
                      className="text-sm px-3 py-1 border border-neutral-200 rounded-lg"
                    >
                      <option value="open">Ouvert</option>
                      <option value="pending">En attente</option>
                      <option value="closed">Fermé</option>
                    </select>
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="p-2 hover:bg-neutral-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-neutral-500">
                      Aucun message dans cette conversation
                    </div>
                  ) : (
                    selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.senderType === "admin"
                            ? "justify-end"
                            : "justify-start",
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] p-3 rounded-lg",
                            message.senderType === "admin"
                              ? "bg-neutral-900 text-white"
                              : "bg-neutral-100 text-neutral-900",
                            message.senderType === "system" &&
                              "bg-blue-50 text-blue-900",
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <p className="text-xs opacity-70">
                              {formatDate(message.createdAt)}
                            </p>
                            {message.isAutomated && <Bot className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-neutral-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      placeholder="Écrivez votre message..."
                      className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-neutral-500">
                <MessageSquare className="w-16 h-16 mb-4" />
                <p>Sélectionnez une conversation pour voir les messages</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
