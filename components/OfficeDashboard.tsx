import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import { User, UserRole, Client, Document, Notification, Fee, FeeStatus } from '../types';
import { 
  Upload, 
  Users, 
  Briefcase, 
  UserPlus, 
  Edit, 
  Trash2, 
  Plus, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Building2,
  Lock,
  History,
  Download
} from 'lucide-react';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';

// ... (rest of the component logic remains similar but using lucide icons and api)


const DocumentUploader: React.FC<{ clients: Client[], onDataChange: () => void }> = ({ clients, onDataChange }) => {
    const [uploadType, setUploadType] = useState<'imposto' | 'documento'>('imposto');
    
    // States for 'imposto'
    const [taxClient, setTaxClient] = useState<string>(clients[0]?.id || '');
    const [title, setTitle] = useState('');
    const [taxFile, setTaxFile] = useState<File | null>(null);

    // States for 'documento'
    const [docClient, setDocClient] = useState<string>(clients[0]?.id || '');
    const [docType, setDocType] = useState<'contratoSocial'>('contratoSocial');
    const [docFile, setDocFile] = useState<File | null>(null);
    
    const [isUploading, setIsUploading] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (!taxClient && clients.length > 0) setTaxClient(clients[0].id);
        if (!docClient && clients.length > 0) setDocClient(clients[0].id);
    }, [clients, taxClient, docClient]);

    const resetForm = () => {
        setTitle('');
        setTaxFile(null);
        setDocFile(null);
        const taxInput = document.getElementById('tax-file-upload') as HTMLInputElement;
        if(taxInput) taxInput.value = '';
        const docInput = document.getElementById('doc-file-upload') as HTMLInputElement;
        if(docInput) docInput.value = '';
    };

    const handleTaxSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taxClient || !title || !taxFile) {
            setFeedback({ message: 'Por favor, preencha todos os campos.', type: 'error' });
            return;
        }
        
        setFeedback(null);
        setIsUploading(true);

        try {
            await api.uploadTaxDocument(taxClient, title, taxFile);
            setFeedback({ message: 'Imposto enviado com sucesso!', type: 'success' });
            resetForm();
            onDataChange();
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Falha ao enviar o imposto.';
            setFeedback({ message: msg, type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

     const handleDocSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!docClient || !docType || !docFile) {
            setFeedback({ message: 'Por favor, preencha todos os campos.', type: 'error' });
            return;
        }
        
        setFeedback(null);
        setIsUploading(true);

        try {
            await api.uploadGeneralDocument(docClient, docType, docFile);
            setFeedback({ message: 'Documento enviado com sucesso!', type: 'success' });
            resetForm();
            onDataChange();
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Falha ao enviar o documento.';
            setFeedback({ message: msg, type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Enviar Documentos</h2>
            
            <fieldset className="mb-6">
                <legend className="block text-sm font-medium text-gray-700 mb-2">Tipo de Envio</legend>
                <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                        <input id="type-imposto" name="upload-type" type="radio" checked={uploadType === 'imposto'} onChange={() => setUploadType('imposto')} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"/>
                        <label htmlFor="type-imposto" className="ml-3 block text-sm font-medium text-gray-700">Imposto</label>
                    </div>
                     <div className="flex items-center">
                        <input id="type-documento" name="upload-type" type="radio" checked={uploadType === 'documento'} onChange={() => setUploadType('documento')} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"/>
                        <label htmlFor="type-documento" className="ml-3 block text-sm font-medium text-gray-700">Documento Geral</label>
                    </div>
                </div>
            </fieldset>

            {uploadType === 'imposto' ? (
                 <form onSubmit={handleTaxSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="client-select-tax" className="block text-sm font-medium text-gray-700">Selecione o Cliente</label>
                        <select id="client-select-tax" value={taxClient} onChange={(e) => setTaxClient(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            {clients.map(client => (<option key={client.id} value={client.id}>{client.name}</option>))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Descrição do Imposto (Ex: DAS - 07/2024)</label>
                        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="DAS - Competência Mês/Ano"/>
                    </div>
                    <div>
                        <label htmlFor="tax-file-upload" className="block text-sm font-medium text-gray-700">Arquivo PDF</label>
                        <input id="tax-file-upload" type="file" accept=".pdf" onChange={(e) => setTaxFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        {taxFile && <p className="mt-2 text-sm text-gray-500">Arquivo selecionado: {taxFile.name}</p>}
                    </div>
                     <button type="submit" disabled={isUploading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed">
                        {isUploading ? 'Enviando...' : 'Enviar Imposto'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleDocSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="client-select-doc" className="block text-sm font-medium text-gray-700">Selecione o Cliente</label>
                        <select id="client-select-doc" value={docClient} onChange={(e) => setDocClient(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            {clients.map(client => (<option key={client.id} value={client.id}>{client.name}</option>))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="doc-type-select" className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
                        <select id="doc-type-select" value={docType} onChange={(e) => setDocType(e.target.value as 'contratoSocial')} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                           <option value="contratoSocial">Contrato Social</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="doc-file-upload" className="block text-sm font-medium text-gray-700">Arquivo</label>
                        <input id="doc-file-upload" type="file" onChange={(e) => setDocFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        {docFile && <p className="mt-2 text-sm text-gray-500">Arquivo selecionado: {docFile.name}</p>}
                    </div>
                     <button type="submit" disabled={isUploading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed">
                        {isUploading ? 'Enviando...' : 'Enviar Documento'}
                    </button>
                </form>
            )}

            {feedback && (
                <div className={`mt-4 p-4 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {feedback.message}
                </div>
            )}
        </div>
    );
};

const EditClientModal: React.FC<{ client: Client, onClose: () => void, onDataChange: () => void }> = ({ client, onClose, onDataChange }) => {
    const [name, setName] = useState(client.name);
    const [cnpj, setCnpj] = useState(client.cnpj || '');
    const [cnpjFile, setCnpjFile] = useState<File | null>(null);
    const [pfxFile, setPfxFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        setFeedback(null);
        try {
            await api.updateClient(client.id, { name, cnpj });
            
            if (cnpjFile) {
                await api.updateClientDocument(client.id, 'cnpj', cnpjFile);
            }
            if (pfxFile) {
                await api.updateClientDocument(client.id, 'certificate', pfxFile);
            }
            onDataChange();
            onClose();
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Erro ao salvar alterações.";
            setFeedback(msg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-8 border w-full max-w-lg shadow-lg rounded-xl bg-white space-y-6">
                <h3 className="text-2xl font-bold text-gray-800">Editar Empresa: {client.name}</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="edit-client-name" className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
                        <input id="edit-client-name" type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                    </div>
                        <div>
                            <label htmlFor="edit-client-cnpj" className="block text-sm font-medium text-gray-700">CNPJ</label>
                            <input id="edit-client-cnpj" type="text" value={cnpj} onChange={e => setCnpj(e.target.value.replace(/\D/g, ''))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Somente números"/>
                        </div>
                    <div>
                        <label htmlFor="edit-cnpj-file" className="block text-sm font-medium text-gray-700">Alterar Cartão CNPJ (PDF)</label>
                        <input id="edit-cnpj-file" type="file" accept=".pdf" onChange={(e) => setCnpjFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        {cnpjFile && <p className="mt-1 text-xs text-gray-500">Novo: {cnpjFile.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="edit-pfx-file" className="block text-sm font-medium text-gray-700">Alterar Certificado Digital (.pfx)</label>
                        <input id="edit-pfx-file" type="file" accept=".pfx,.p12" onChange={(e) => setPfxFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        {pfxFile && <p className="mt-1 text-xs text-gray-500">Novo: {pfxFile.name}</p>}
                    </div>
                </div>
                {feedback && <p className="text-red-500 text-sm">{feedback}</p>}
                <div className="flex items-center justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ClientsManager: React.FC<{ clients: Client[], officeId?: string, onDataChange: () => void }> = ({ clients, officeId, onDataChange }) => {
    const [name, setName] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [cnpjFile, setCnpjFile] = useState<File | null>(null);
    const [pfxFile, setPfxFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !cnpj || !officeId) {
            setFeedback({ message: 'Nome da empresa, CNPJ e escritório são obrigatórios.', type: 'error' });
            return;
        }

        setFeedback(null);
        setIsSubmitting(true);
        try {
            await api.addClient(name, cnpj, officeId);
            setFeedback({ message: `Empresa "${name}" cadastrada com sucesso!`, type: 'success' });
            onDataChange();
            
            setName('');
            setCnpj('');
            setCnpjFile(null);
            setPfxFile(null);
            (document.getElementById('client-form') as HTMLFormElement)?.reset();

        } catch (error) {
            console.error('Error adding client:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro ao cadastrar empresa. Verifique se o CNPJ já existe.';
            setFeedback({ message: errorMessage, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="space-y-8">
            {editingClient && <EditClientModal client={editingClient} onClose={() => setEditingClient(null)} onDataChange={onDataChange} />}
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Cadastrar Nova Empresa</h2>
                <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
                                Nome da Empresa
                            </label>
                            <input
                                type="text"
                                id="company-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Ex: Empresa Exemplo Ltda"
                            />
                        </div>
                        <div>
                            <label htmlFor="company-cnpj" className="block text-sm font-medium text-gray-700">
                                CNPJ
                            </label>
                            <input
                                type="text"
                                id="company-cnpj"
                                value={cnpj}
                                onChange={(e) => setCnpj(e.target.value.replace(/\D/g, ''))}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Somente números"
                            />
                        </div>
                   </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="cnpj-file" className="block text-sm font-medium text-gray-700">Cartão CNPJ (PDF)</label>
                            <input id="cnpj-file" type="file" accept=".pdf" onChange={(e) => setCnpjFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                            {cnpjFile && <p className="mt-1 text-xs text-gray-500">Selecionado: {cnpjFile.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="pfx-file" className="block text-sm font-medium text-gray-700">Certificado Digital (.pfx)</label>
                            <input id="pfx-file" type="file" accept=".pfx,.p12" onChange={(e) => setPfxFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                            {pfxFile && <p className="mt-1 text-xs text-gray-500">Selecionado: {pfxFile.name}</p>}
                        </div>
                    </div>
                    {feedback && (
                        <div className={`p-4 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {feedback.message}
                        </div>
                    )}
                    <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400">
                        {isSubmitting ? 'Cadastrando...' : 'Cadastrar Empresa'}
                    </button>
                </form>
            </div>
            <div className="bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 p-8 pb-4">Empresas Cadastradas</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="bg-white divide-y divide-gray-200">
                            {clients.map(client => (
                                <tr key={client.id}>
                                    <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                                    <td className="px-8 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-4">
                                        <button onClick={() => setEditingClient(client)} className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                                            <Edit className="w-4 h-4" />
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => setClientToDelete(client)} 
                                            className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {clientToDelete && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative mx-auto p-8 border w-full max-w-md shadow-lg rounded-xl bg-white space-y-6">
                        <h3 className="text-xl font-bold text-gray-800">Confirmar Exclusão</h3>
                        <p className="text-gray-600">
                            Tem certeza que deseja excluir a empresa <span className="font-semibold">{clientToDelete.name}</span>? Todos os documentos e honorários vinculados serão removidos permanentemente.
                        </p>
                        <div className="flex items-center justify-end space-x-4 pt-4">
                            <button onClick={() => setClientToDelete(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                            <button 
                                onClick={async () => {
                                    try {
                                        await api.deleteClient(clientToDelete.id);
                                        onDataChange();
                                        setClientToDelete(null);
                                    } catch (error) {
                                        alert('Erro ao excluir empresa.');
                                    }
                                }} 
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const FeesManager: React.FC<{ clients: Client[], onDataChange: () => void }> = ({ clients, onDataChange }) => {
    const [selectedClient, setSelectedClient] = useState<string>(clients[0]?.id || '');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState<FeeStatus>(FeeStatus.Pending);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [updatingFeeId, setUpdatingFeeId] = useState<string | null>(null);
    const [filterClientId, setFilterClientId] = useState<string>('all');
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const toggleMonth = (m: string) => {
        setSelectedMonths(prev => 
            prev.includes(m) ? prev.filter(item => item !== m) : [...prev, m]
        );
    };


     useEffect(() => {
        if (!selectedClient && clients.length > 0) {
            setSelectedClient(clients[0].id);
        }
    }, [clients, selectedClient]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedClient || !month || !year || !amount){
            setFeedback({ message: 'Por favor, preencha todos os campos.', type: 'error' });
            return;
        }
        
        setFeedback(null);
        setIsSubmitting(true);
        try {
            await api.addFee(selectedClient, { month, year, amount: parseFloat(amount), status });
            onDataChange();
            setFeedback({ message: 'Honorário cadastrado com sucesso!', type: 'success' });
            setMonth('');
            setAmount('');
        } catch (error) {
            setFeedback({ message: 'Erro ao cadastrar honorário.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (clientId: string, feeId: string, newStatus: FeeStatus) => {
        setUpdatingFeeId(feeId);
        await api.updateFeeStatus(clientId, feeId, newStatus);
        onDataChange();
        setUpdatingFeeId(null);
    };
    
    const filteredFees = useMemo(() => 
        clients
        .filter(client => filterClientId === 'all' || client.id === filterClientId)
        .flatMap(client =>
            client.fees.map(fee => ({
                ...fee,
                clientName: client.name,
                clientId: client.id,
            }))
        )
        .filter(fee => selectedMonths.length === 0 || selectedMonths.includes(fee.month))
        .sort((a, b) => {
            // A more robust sorting by year and month
            const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
            const monthA = monthNames.indexOf(a.month.toLowerCase());
            const monthB = monthNames.indexOf(b.month.toLowerCase());
            const dateA = new Date(a.year, monthA);
            const dateB = new Date(b.year, monthB);
            return dateB.getTime() - dateA.getTime();
        }),
    [clients, filterClientId]);

    const statusStyles: { [key in FeeStatus]: string } = {
        [FeeStatus.Paid]: 'bg-green-100 text-green-800',
        [FeeStatus.Pending]: 'bg-yellow-100 text-yellow-800',
        [FeeStatus.Overdue]: 'bg-red-100 text-red-800',
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Cadastrar Honorários</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="client-select-fees" className="block text-sm font-medium text-gray-700">
                            Selecione a Empresa
                        </label>
                        <select id="client-select-fees" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            {clients.map(client => ( <option key={client.id} value={client.id}>{client.name}</option>))}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="fee-month" className="block text-sm font-medium text-gray-700">Mês</label>
                            <input type="text" id="fee-month" value={month} onChange={e => setMonth(e.target.value)} placeholder="Ex: Julho" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="fee-year" className="block text-sm font-medium text-gray-700">Ano</label>
                            <input type="number" id="fee-year" value={year} onChange={e => setYear(parseInt(e.target.value))} placeholder="Ex: 2024" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="fee-amount" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                            <input type="number" step="0.01" id="fee-amount" value={amount} onChange={e => setAmount(e.target.value)} placeholder="500.00" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="fee-status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select id="fee-status" value={status} onChange={e => setStatus(e.target.value as FeeStatus)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                <option value={FeeStatus.Pending}>Pendente</option>
                                <option value={FeeStatus.Paid}>Pago</option>
                                <option value={FeeStatus.Overdue}>Atrasado</option>
                            </select>
                        </div>
                    </div>
                    {feedback && (
                        <div className={`p-4 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {feedback.message}
                        </div>
                    )}
                    <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400">
                        {isSubmitting ? 'Cadastrando...' : 'Cadastrar Honorário'}
                    </button>
                </form>
            </div>

             <div className="bg-white rounded-xl shadow-lg">
                <div className="p-8 pb-4 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <h2 className="text-2xl font-bold text-gray-800">Histórico de Honorários</h2>
                        <div className="w-full sm:w-auto">
                            <label htmlFor="filter-client" className="sr-only">Filtrar por Empresa</label>
                            <select 
                                id="filter-client"
                                value={filterClientId}
                                onChange={e => setFilterClientId(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="all">Todas as Empresas</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm font-semibold text-gray-600 mb-3">Filtrar por Meses:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {months.map(m => (
                                <label key={m} className="flex items-center space-x-2 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedMonths.includes(m)}
                                        onChange={() => toggleMonth(m)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">{m}</span>
                                </label>
                            ))}
                        </div>
                        {selectedMonths.length > 0 && (
                            <button 
                                onClick={() => setSelectedMonths([])}
                                className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                            >
                                Limpar filtros de mês
                            </button>
                        )}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredFees.map(fee => (
                                <tr key={fee.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fee.clientName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fee.month}/{fee.year}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {fee.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <select
                                            value={fee.status}
                                            onChange={(e) => handleStatusChange(fee.clientId, fee.id, e.target.value as FeeStatus)}
                                            disabled={updatingFeeId === fee.id}
                                            className={`w-full text-xs font-medium border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 ${statusStyles[fee.status]}`}
                                        >
                                            <option value={FeeStatus.Pending}>Pendente</option>
                                            <option value={FeeStatus.Paid}>Pago</option>
                                            <option value={FeeStatus.Overdue}>Atrasado</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                             {filteredFees.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500">Nenhum honorário encontrado para a seleção.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const EditUserModal: React.FC<{
  user: User;
  clients: Client[];
  onClose: () => void;
  onDataChange: () => void;
  currentUser: User | null;
}> = ({ user, clients, onClose, onDataChange, currentUser }) => {
    const [name, setName] = useState(user.name);
    const [username, setUsername] = useState(user.username);
    const [password, setPassword] = useState('');
    const [selectedClient, setSelectedClient] = useState(user.clientId || 'none');
    const [role, setRole] = useState<UserRole>(user.role);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleSave = async () => {
        if (!name || !username || (role === UserRole.Client && selectedClient === 'none')) {
            setFeedback({ message: 'Nome, nome de usuário e empresa (para clientes) são obrigatórios.', type: 'error' });
            return;
        }

        setIsSaving(true);
        setFeedback(null);

        const updates: { name: string, username: string, clientId: string, role: UserRole, password?: string } = {
            name,
            username,
            clientId: selectedClient,
            role: role
        };

        if (password) {
            updates.password = password;
        }

        try {
            await api.updateUser(user.id, updates, currentUser?.id);
            onDataChange();
            onClose();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro ao salvar alterações.";
            setFeedback({ message: errorMessage, type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-8 border w-full max-w-lg shadow-lg rounded-xl bg-white space-y-6">
                <h3 className="text-2xl font-bold text-gray-800">Editar Usuário: {user.name}</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="edit-user-name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                        <input id="edit-user-name" type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="edit-user-username" className="block text-sm font-medium text-gray-700">Nome de Usuário</label>
                        <input id="edit-user-username" type="text" value={username} onChange={e => setUsername(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                    </div>
                     <div>
                        <label htmlFor="edit-user-password"  className="block text-sm font-medium text-gray-700">Nova Senha</label>
                        <input type="password" id="edit-user-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Deixe em branco para manter a atual"/>
                    </div>
                    <div>
                        <label htmlFor="edit-user-role" className="block text-sm font-medium text-gray-700">Tipo de Usuário</label>
                        <select id="edit-user-role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                           <option value={UserRole.Client}>Cliente</option>
                           <option value={UserRole.Accountant}>Contador</option>
                        </select>
                    </div>
                     {role === UserRole.Client && (
                        <div>
                            <label htmlFor="edit-user-client" className="block text-sm font-medium text-gray-700">Vincular à Empresa</label>
                            <select id="edit-user-client" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                               <option value="none">Nenhuma</option>
                               {clients.map(client => ( <option key={client.id} value={client.id}>{client.name}</option> ))}
                            </select>
                        </div>
                     )}
                </div>
                {feedback && <p className={`${feedback.type === 'error' ? 'text-red-500' : 'text-green-600'} text-sm`}>{feedback.message}</p>}
                <div className="flex items-center justify-end space-x-4 pt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    )
};

const DeleteConfirmationModal: React.FC<{
  user: User;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}> = ({ user, onClose, onConfirm }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        await onConfirm();
        // The onClose call is handled by the parent component after data refresh
    };

    return (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-8 border w-full max-w-md shadow-lg rounded-xl bg-white space-y-6">
                <h3 className="text-xl font-bold text-gray-800">Confirmar Exclusão</h3>
                <p className="text-gray-600">
                    Tem certeza que deseja excluir o usuário <span className="font-semibold">{user.name}</span> ({user.username})? Esta ação não pode ser desfeita.
                </p>
                <div className="flex items-center justify-end space-x-4 pt-4">
                    <button onClick={onClose} disabled={isDeleting} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancelar</button>
                    <button onClick={handleConfirm} disabled={isDeleting} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400">
                        {isDeleting ? 'Excluindo...' : 'Excluir'}
                    </button>
                </div>
            </div>
        </div>
    )
};

const UsersManager: React.FC<{
  clients: Client[];
  users: User[];
  officeId?: string;
  onDataChange: () => void;
  currentUser: User | null;
}> = ({ clients, users, officeId, onDataChange, currentUser }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.Client);
    const [selectedClient, setSelectedClient] = useState<string>(clients[0]?.id || 'none');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    useEffect(() => {
        if (selectedClient === 'none' && role === UserRole.Client && clients.length > 0) {
            setSelectedClient(clients[0].id);
        }
    }, [clients, selectedClient, role]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !username || !password || (role === UserRole.Client && selectedClient === 'none') || !officeId){
            setFeedback({ message: 'Por favor, preencha todos os campos.', type: 'error' });
            return;
        }

        setFeedback(null);
        setIsSubmitting(true);
        try {
            await api.createUser(name, username, password, selectedClient, officeId, role, currentUser?.id);
            setFeedback({ message: `Usuário "${name}" criado com sucesso!`, type: 'success' });
            onDataChange();
            
            setName('');
            setUsername('');
            setPassword('');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao criar usuário.';
            setFeedback({ message: errorMessage, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteConfirm = async () => {
        if (!deletingUser) return;
        await api.deleteUser(deletingUser.id, currentUser?.id);
        onDataChange();
        setDeletingUser(null);
    };
    
    return (
        <div className="space-y-8">
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    clients={clients}
                    onClose={() => setEditingUser(null)}
                    onDataChange={onDataChange}
                    currentUser={currentUser}
                />
            )}
            {deletingUser && (
                <DeleteConfirmationModal
                    user={deletingUser}
                    onClose={() => setDeletingUser(null)}
                    onConfirm={handleDeleteConfirm}
                />
            )}
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Criar Novo Usuário de Cliente</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="user-fullname" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                        <input type="text" id="user-fullname" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ex: Daiana Silva"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="user-username" className="block text-sm font-medium text-gray-700">Nome de Usuário</label>
                            <input type="text" id="user-username" value={username} onChange={e => setUsername(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ex: daiana.silva"/>
                        </div>
                        <div>
                            <label htmlFor="user-password"  className="block text-sm font-medium text-gray-700">Senha</label>
                            <input type="password" id="user-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="********"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="user-role-select" className="block text-sm font-medium text-gray-700">Tipo de Usuário</label>
                            <select id="user-role-select" value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                               <option value={UserRole.Client}>Cliente</option>
                               <option value={UserRole.Accountant}>Contador</option>
                            </select>
                        </div>
                        {role === UserRole.Client && (
                            <div>
                                <label htmlFor="user-client-select" className="block text-sm font-medium text-gray-700">Vincular à Empresa</label>
                                <select id="user-client-select" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                   <option value="none">Nenhuma</option>
                                   {clients.map(client => ( <option key={client.id} value={client.id}>{client.name}</option> ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {feedback && (
                        <div className={`p-4 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {feedback.message}
                        </div>
                    )}
                    <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400">
                        {isSubmitting ? 'Criando...' : 'Criar Usuário'}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 p-8 pb-4">Usuários Cadastrados</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome Completo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa Vinculada</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => {
                                const clientName = clients.find(c => c.id === user.clientId)?.name || 'N/A';
                                return (
                                    <tr key={user.id}>
                                        <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.role === UserRole.Accountant ? 'Contador' : 'Cliente'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{clientName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-4">
                                            <button 
                                                onClick={() => {
                                                    setSelectedUserId(user.id);
                                                    setIsPasswordModalOpen(true);
                                                }}
                                                className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                title="Alterar Senha"
                                            >
                                                <Lock className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setEditingUser(user)} className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            {!(currentUser?.role === UserRole.Accountant && user.role === UserRole.OfficeAdmin) && (
                                                <button onClick={() => setDeletingUser(user)} className="text-red-600 hover:text-red-900 flex items-center gap-1">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Alterar Senha</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const newPassword = formData.get('password') as string;
                            
                            try {
                                if (selectedUserId) {
                                    await api.updateUserPassword(selectedUserId, newPassword);
                                    setIsPasswordModalOpen(false);
                                    alert('Senha alterada com sucesso!');
                                }
                            } catch (error) {
                                alert('Erro ao alterar senha');
                            }
                        }} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nova Senha</label>
                                <input 
                                    name="password" 
                                    type="password" 
                                    required 
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    placeholder="Digite a nova senha"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">Atualizar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const DocumentsManager: React.FC<{ clients: Client[], onDataChange: () => void }> = ({ clients, onDataChange }) => {
    const [filterClientId, setFilterClientId] = useState<string>('all');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'document' | 'notification', name: string} | null>(null);

    const allItems = useMemo(() => {
        const docs = clients.flatMap(c => c.documents.map(d => ({ ...d, clientName: c.name, clientId: c.id, itemType: 'document' as const })));
        const notifs = clients.flatMap(c => c.notifications.map(n => ({ ...n, clientName: c.name, clientId: c.id, itemType: 'notification' as const })));
        
        return [...docs, ...notifs].sort((a, b) => {
            const dateA = 'date' in a ? new Date(a.date).getTime() : 0;
            const dateB = 'date' in b ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
        });
    }, [clients]);

    const filteredItems = allItems.filter(item => filterClientId === 'all' || item.clientId === filterClientId);

    const handleDelete = async () => {
        if (!itemToDelete) return;
        
        setIsDeleting(itemToDelete.id);
        try {
            if (itemToDelete.type === 'document') {
                await api.deleteDocument(itemToDelete.id);
            } else {
                await api.deleteNotification(itemToDelete.id);
            }
            onDataChange();
            setItemToDelete(null);
        } catch (error) {
            alert('Erro ao excluir documento.');
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg">
                <div className="p-8 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">Documentos Enviados</h2>
                    <div className="w-full sm:w-64">
                        <select 
                            value={filterClientId}
                            onChange={e => setFilterClientId(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="all">Todas as Empresas</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome/Título</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredItems.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.clientName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{'name' in item ? item.name : item.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.itemType === 'notification' ? 'Imposto' : 'Geral'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {'date' in item ? new Date(item.date).toLocaleDateString('pt-BR') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3">
                                        <a 
                                            href={item.fileUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:text-indigo-900"
                                            title="Download"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                        <button 
                                            onClick={() => setItemToDelete({
                                                id: item.id, 
                                                type: item.itemType, 
                                                name: 'name' in item ? item.name : item.title
                                            })}
                                            className="text-red-600 hover:text-red-900"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">Nenhum documento encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {itemToDelete && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Confirmar Exclusão</h3>
                        <p className="text-slate-600 mb-6">
                            Tem certeza que deseja excluir o documento <span className="font-bold text-slate-900">"{itemToDelete.name}"</span>? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setItemToDelete(null)} 
                                className="flex-1 px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleDelete}
                                disabled={!!isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-100 disabled:opacity-50"
                            >
                                {isDeleting ? 'Excluindo...' : 'Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const OfficeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upload'); 

  const fetchData = useCallback(async () => {
      const [clientsData, usersData] = await Promise.all([
          api.getOfficeClients(user?.officeId),
          api.getUsers(user?.officeId)
      ]);
      setClients(clientsData);
      setUsers(usersData);
      setLoading(false);
  }, [user?.officeId]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const getTabClass = (tabName: string) => 
    `flex items-center justify-center sm:justify-start px-4 py-2.5 sm:py-3 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap ${
      activeTab === tabName
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
        : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
    }`;
    
  const renderContent = () => {
      if (loading) {
          return (
            <div className="flex flex-col items-center justify-center p-20 text-slate-400">
              <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <p className="font-medium">Carregando dados do escritório...</p>
            </div>
          );
      }
      switch (activeTab) {
          case 'clients':
              return <ClientsManager clients={clients} officeId={user?.officeId} onDataChange={fetchData} />;
          case 'users':
            return <UsersManager clients={clients} users={users} officeId={user?.officeId} onDataChange={fetchData} currentUser={user} />;
          case 'fees':
              return <FeesManager clients={clients} onDataChange={fetchData} />;
          case 'documents':
              return <DocumentsManager clients={clients} onDataChange={fetchData} />;
          case 'upload':
          default:
              return <DocumentUploader clients={clients} onDataChange={fetchData} />;
      }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
          <aside className="w-full md:w-64 shrink-0">
            <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide">
              <button className={getTabClass('upload')} onClick={() => setActiveTab('upload')}>
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> Enviar
              </button>
              <button className={getTabClass('clients')} onClick={() => setActiveTab('clients')}>
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> Empresas
              </button>
              <button className={getTabClass('users')} onClick={() => setActiveTab('users')}>
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> Usuários
              </button>
              {user?.role === UserRole.OfficeAdmin && (
                <button className={getTabClass('fees')} onClick={() => setActiveTab('fees')}>
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> Honorários
                </button>
              )}
              <button className={getTabClass('documents')} onClick={() => setActiveTab('documents')}>
                <History className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> Histórico
              </button>
            </nav>
          </aside>
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OfficeDashboard;