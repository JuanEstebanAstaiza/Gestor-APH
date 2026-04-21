import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import DataTable from "../../components/common/DataTable";
import SearchBar from "../../components/common/SearchBar";

export default function DocumentSearch() {
  const [query, setQuery] = useState("");

  const { data } = useQuery({
    queryKey: ["documents-search", query],
    queryFn: () => api.get("/api/documents/search", { params: { q: query } }).then((r) => r.data),
    enabled: query.length >= 2,
    staleTime: 0,
  });

  const columns = [
    { key: "title", label: "Título" },
    { key: "file_type", label: "Tipo" },
    { key: "created_at", label: "Fecha" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Buscar documentos</h1>
      <SearchBar onSearch={setQuery} placeholder="Buscar por título..." />
      {query.length >= 2 && data?.data && <DataTable columns={columns} data={data.data} />}
    </div>
  );
}
