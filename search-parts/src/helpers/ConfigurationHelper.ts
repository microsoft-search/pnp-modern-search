import { Log } from '@microsoft/sp-core-library';
import { IConfigurationDefinition, IConfiguration, IConfigurationProps } from '@pnp/modern-search-extensibility';
import { IConfigSetup } from '../models/common/IConfigSetup';
import { ObjectHelper } from '../helpers/ObjectHelper';

export interface IConfigurationSyncResult {
    Configurations: IConfiguration[];
    Properties: IConfigurationProps[];
}

/**
 * Shared helper methods
 */
export class ConfigurationHelper {

    /**
     * Create a hash of definitions
     * @param configDefinitions The configuration definitions we want to create a hash from 
     */
    public static makeConfigurationDefinitionHash(configDefinitions:IConfigurationDefinition<any>[]) : {[key:string]:IConfigurationDefinition<any>} {
        const configHash : {[key:string]:IConfigurationDefinition<any>} = {};
        configDefinitions.map((m)=>{ configHash[m.id] = m; });
        return configHash;
    }

    /**
     * Create a new Configuration
     * @param definition the configuration definition.
     */
    public static createConfiguration(definition: IConfigurationDefinition<any>) : IConfiguration {

        try {

            const newConfig : any = ObjectHelper.create(definition.configurationClass); 
            newConfig.properties.configurationId = definition.id;
            return newConfig;

        } catch(ex) {

            Log.error("[MSWP.ConfigurationHelper.createConfiguration()]: Failure Creating Configuration. ", ex);
            return null;

        }

    }

    /**
     * Synchronizes updates to Configuration Properties & Configurations
     * @param newConfigs The updated configuration property
     * @param definitions All available configuration definitions
     * @param properties Web part property bag configuration property
     * @param configurations The existing private configuration instances within the web part
     */
    public static synchronizeConfigurations(newConfigs:IConfigSetup[],
                                        definitions: IConfigurationDefinition<any>[],
                                        properties: IConfigurationProps[], 
                                        configurations: IConfiguration[]) : IConfigurationSyncResult {

        const newActiveConfiguration : IConfiguration[] = [];
        const newConfiguration : IConfigurationProps[] = [];
        const configHash = this.makeConfigurationDefinitionHash(definitions);

        const existingConfigs : {[key:string]:IConfigurationProps} = {};
        properties.map((c)=>{ existingConfigs[c.key + c.configurationId] = c; });
        
        const existingActiveConfigs : {[key:string]:IConfiguration} = {};
        configurations.map((c)=>{ existingActiveConfigs[c.properties.key + c.properties.configurationId] = c; });
    
        newConfigs.map((c)=> {
    
          const key = c.Key + c.Type;
    
          if(existingConfigs[key]) {
            
            newConfiguration.push(existingConfigs[key]);
            newActiveConfiguration.push(existingActiveConfigs[key]);
    
          } else {
    
            const def = configHash[c.Type];
            const config = this.createConfiguration(def);
    
            if(config) { // handle failures creating configurations gracefully
    
              config.properties.key = c.Key;
    
              newConfiguration.push(config.properties);
              newActiveConfiguration.push(config);
    
            }
    
          }
    
        });
    
        return {
            Properties: newConfiguration,
            Configurations: newActiveConfiguration
        };
        
    }

    /*
    * Load custom property pane configurations from extensibility libraries
    */
    public static loadCustomConfigurations(configDefinitions: IConfigurationDefinition<any>[], properties: IConfigurationProps[]) {

        const configHash = this.makeConfigurationDefinitionHash(configDefinitions);
        const activeConfigs = properties
            ? properties.map((configProperties : IConfigurationProps)=>{
                
                const definition = configHash[configProperties.configurationId];
                const config = this.createConfiguration(definition);

                if(config) { // handle failures creating configurations gracefully
                    config.properties = configProperties;
                }

                return config;
            })
            : [];

        return activeConfigs.filter((c)=>{return c;});

    }

    /**
     * Convert the webpart configuration property into a vanilla js object for injection into template
     * @param properties The web part configurations property
     */
    public static convertToContextObject(properties: IConfigurationProps[]) : any {
        const configs = {};
        if(properties && properties.length > 0) {
            properties.map((config)=>{
                configs[config.key] = config;
            });
        }
        return configs;
    }

}