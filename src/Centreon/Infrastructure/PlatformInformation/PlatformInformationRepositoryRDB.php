<?php

/*
 * Copyright 2005 - 2020 Centreon (https://www.centreon.com/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * For more information : contact@centreon.com
 *
 */
declare(strict_types=1);

namespace Centreon\Infrastructure\PlatformInformation;

use Centreon\Domain\PlatformInformation\PlatformInformation;
use Centreon\Domain\PlatformInformation\Interfaces\PlatformInformationRepositoryInterface;
use Centreon\Infrastructure\DatabaseConnection;
use Centreon\Infrastructure\Repository\AbstractRepositoryDRB;

/**
 * This class is designed to manage the repository of the platform topology requests
 *
 * @package Centreon\Infrastructure\PlatformTopology
 */
class PlatformInformationRepositoryRDB extends AbstractRepositoryDRB implements PlatformInformationRepositoryInterface
{
    /**
     * PlatformTopologyRepositoryRDB constructor.
     * @param DatabaseConnection $db
     */
    public function __construct(DatabaseConnection $db)
    {
        $this->db = $db;
    }

    /**
     * @inheritDoc
     */
    public function findPlatformInformation(): ?PlatformInformation
    {
        $statement = $this->db->prepare(
            $this->translateDbName('
                SELECT * FROM `:db`.informations
            ')
        );
        $result = [];
        $platformInformation = null;
        if ($statement->execute()) {
            while ($row = $statement->fetch(\PDO::FETCH_ASSOC)) {
                $result[$row['key']] = $row['value'];
            }

            if (!empty($result)) {
                $platformInformation = new PlatformInformation();
                $platformInformation
                    ->setIsRemote('yes' === $result['isRemote'])
                    ->setAuthorizedMaster($result['authorizedMaster'] ?? null)
                    ->setApiUsername($result['apiUsername'] ?? null)
                    ->setApiCredentials($result['apiCredentials'] ?? null)
                    ->setApiScheme($result['apiScheme'] ?? null)
                    ->setApiPort(isset($result['apiPort']) ? (int) $result['apiPort'] : null)
                    ->setApiPath($result['apiPath'] ?? null)
                    ->setSslPeerValidationRequired('yes' === $result['apiPeerValidation']);
            }
        }

        return $platformInformation;
    }
}
