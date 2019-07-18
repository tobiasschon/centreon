<?php
namespace CentreonRemote\Domain\Exporter;

use CentreonRemote\Infrastructure\Service\ExporterServiceAbstract;
use Centreon\Domain\Repository;

class HostExporter extends ExporterServiceAbstract
{

    const NAME = 'host';
    const EXPORT_FILE_GROUP = 'hostgroup.yaml';
    const EXPORT_FILE_GROUP_HG_RELATION = 'hostgroup_hg_relation.yaml';
    const EXPORT_FILE_GROUP_RELATION = 'hostgroup_relation.yaml';
    const EXPORT_FILE_CATEGORY = 'hostcategories.yaml';
    const EXPORT_FILE_CATEGORY_RELATION = 'hostcategories_relation.yaml';
    const EXPORT_FILE_HOST = 'host.yaml';
    const EXPORT_FILE_INFO = 'extended_host_information.yaml';
    const EXPORT_FILE_MACRO = 'on_demand_macro_host.yaml';
    const EXPORT_FILE_TEMPLATE = 'host_template_relation.yaml';

    /**
     * Cleanup database
     */
    public function cleanup(): void
    {
        $db = $this->db->getAdapter('configuration_db');

        $db->getRepository(Repository\HostRepository::class)->truncate();
    }

    /**
     * Export data
     */
    public function export(): void
    {
        // create path
        $this->createPath();
        $pollerIds = $this->commitment->getPollers();

        /*
         * Build cahes
         */

        // Build cache of Host IDs list
        $hostList = $this->_getIf('host.id.list', function () use ($pollerIds) {
            $baList = $this->cache->get('ba.list');

            return $this->db
                ->getRepository(Repository\HostRepository::class)
                ->getHostIdsByPoller($pollerIds, $baList)
            ;
        });

        // Build the cache of HTPL from cache of Host IDs
        $hostTemplateChain = $this->_getIf('host.tpl.relation.chain', function () use ($hostList) {
            $baList = $this->cache->get('ba.list');

            return $this->db
                ->getRepository(Repository\HostTemplateRelationRepository::class)
                ->getChainByHostIds($hostList, $baList)
            ;
        });

        /* 
         *Extract data
         */

        // Extract host data
        (function () use ($hostList, $hostTemplateChain) {
            $hosts = $this->db
                ->getRepository(Repository\HostRepository::class)
                ->export($hostList, $hostTemplateChain)
            ;
            $this->_dump($hosts, $this->getFile(static::EXPORT_FILE_HOST));
        })();

        // Extract categories used by hosts
        (function () use ($hostList, $hostTemplateChain) {
            $hostCategories = $this->db
                ->getRepository(Repository\HostCategoryRepository::class)
                ->export($hostList, $hostTemplateChain)
            ;
            $this->_dump($hostCategories, $this->getFile(static::EXPORT_FILE_CATEGORY));
        })();

        // Extract relationships between hosts and host categories
        (function () use ($hostList, $hostTemplateChain) {
            $hostCategoryRelation = $this->db
                ->getRepository(Repository\HostCategoryRelationRepository::class)
                ->export($hostList, $hostTemplateChain)
            ;
            $this->_dump($hostCategoryRelation, $this->getFile(static::EXPORT_FILE_CATEGORY_RELATION));
        })();

        // Extract list of hostgroups used by hosts
        (function () use ($hostList, $hostTemplateChain) {
            $hostGroups = $this->db
                ->getRepository(Repository\HostGroupRepository::class)
                ->export($hostList, $hostTemplateChain)
            ;
            $this->_dump($hostGroups, $this->getFile(static::EXPORT_FILE_GROUP));
        })();

        // Extract relationships between hosts and hostgroups
        (function () use ($hostList, $hostTemplateChain) {
            $hostGroupRelation = $this->db
                ->getRepository(Repository\HostGroupRelationRepository::class)
                ->export($hostList, $hostTemplateChain)
            ;
            $this->_dump($hostGroupRelation, $this->getFile(static::EXPORT_FILE_GROUP_RELATION));
        })();

        // Extract extended information of hosts
        (function () use ($hostList, $hostTemplateChain) {
            $hostInfo = $this->db
                ->getRepository(Repository\ExtendedHostInformationRepository::class)
                ->export($hostList, $hostTemplateChain)
            ;
            $this->_dump($hostInfo, $this->getFile(static::EXPORT_FILE_INFO));
        })();

        // Extract on demand macros of hosts
        (function () use ($hostList, $hostTemplateChain) {
            $hostMacros = $this->db
                ->getRepository(Repository\OnDemandMacroHostRepository::class)
                ->export($hostList, $hostTemplateChain)
            ;
            $this->_dump($hostMacros, $this->getFile(static::EXPORT_FILE_MACRO));
        })();

        // Extract relationships between hosttemplates and hosts or hosttemplates
        (function () use ($hostList, $hostTemplateChain) {
            $hostTemplates = $this->db
                ->getRepository(Repository\HostTemplateRelationRepository::class)
                ->export($hostList, $hostTemplateChain)
            ;
            $this->_dump($hostTemplates, $this->getFile(static::EXPORT_FILE_TEMPLATE));
        })();
    }

    /**
     * Import data
     */
    public function import(): void
    {
        // skip if no data
        if (!is_dir($this->getPath())) {
            return;
        }

        $db = $this->db->getAdapter('configuration_db');

        // start transaction
        $db->beginTransaction();

        // allow insert records without foreign key checks
        $db->query('SET FOREIGN_KEY_CHECKS=0;');

        // truncate tables
        $this->cleanup();

        // insert host
        (function () use ($db) {
            $exportPathFile = $this->getFile(static::EXPORT_FILE_HOST);
            $result = $this->_parse($exportPathFile);

            $dataHostServerRelation = array();
            $dataHosts = array();

            foreach ($result as $data) {

                if ($data['_nagios_id']) {
                    $dataHostServerRelation[] = array(
                        'nagios_server_id' => $data['_nagios_id'],
                        'host_host_id' => $data['host_id'],
                    );
                }

                unset($data['_nagios_id']);
                $dataHosts[] = $data;
            }

            // Insert latest values
            if ($dataHosts) {
                // Insert values by group of BULK_SIZE
                $db->insertBulk('host', $dataHosts);

                // Unset array after insert
                unset($dataHosts);
            }
            if ($dataHostServerRelation) {
                // Insert values by group of BULK_SIZE
                $db->insertBulk('ns_host_relation', $dataHostServerRelation);

                // Reset array after insert
                unset($dataHostServerRelation);
            }
            unset($result);
        })();

        // insert groups
        (function () use ($db) {
            $exportPathFile = $this->getFile(static::EXPORT_FILE_GROUP);
            $result = $this->_parse($exportPathFile);

            $db->insertBulk('hostgroup', $result);

            unset($result);
        })();

        // insert group relation
        (function () use ($db) {
            $exportPathFile = $this->getFile(static::EXPORT_FILE_GROUP_RELATION);
            $result = $this->_parse($exportPathFile);

            $db->insertBulk('hostgroup_relation', $result);

            unset($result);
        })();

        // insert categories
        (function () use ($db) {
            $exportPathFile = $this->getFile(static::EXPORT_FILE_CATEGORY);
            $result = $this->_parse($exportPathFile);

            $db->insertBulk('hostcategories', $result);

            unset($result);
        })();

        // insert categories relation
        (function () use ($db) {
            $exportPathFile = $this->getFile(static::EXPORT_FILE_CATEGORY_RELATION);
            $result = $this->_parse($exportPathFile);

            $db->insertBulk('hostcategories_relation', $result);

            unset($result);
        })();

        // insert info
        (function () use ($db) {
            $exportPathFile = $this->getFile(static::EXPORT_FILE_INFO);
            $result = $this->_parse($exportPathFile);

            $db->insertBulk('extended_host_information', $result);

            unset($result);
        })();

        // insert macro
        (function () use ($db) {
            $exportPathFile = $this->getFile(static::EXPORT_FILE_MACRO);
            $result = $this->_parse($exportPathFile);

            $db->insertBulk('on_demand_macro_host', $result);

            unset($result);
        })();

        // insert template
        (function () use ($db) {
            $exportPathFile = $this->getFile(static::EXPORT_FILE_TEMPLATE);
            $result = $this->_parse($exportPathFile);

            $db->insertBulk('host_template_relation', $result);

            unset($result);
        })();

        // restore foreign key checks
        $db->query('SET FOREIGN_KEY_CHECKS=1;');

        // commit transaction
        $db->commit();
    }

    public static function order(): int
    {
        return 30;
    }
}
